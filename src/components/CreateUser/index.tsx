import {
    Box,
    Center,
    Checkbox,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { isCEP, isCPF } from "brazilian-values";
import { getIn, useFormik } from "formik";
import React, { ReactNode, useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import YupPassword from "yup-password";
import { useAccount } from "../../contexts/accountContext";
import { PersonTypeEnum } from "../../enum/person.type.enum";
import { IListPatient } from "../../interfaces/patient/create.patient.dto";
import { getPatientByCPF } from "../../services/getPatientByCPF";
import { listPatient } from "../../services/listPatient";
import { receitaCpfApi } from "../../services/receitaCpfApi";
import { saveDoctor } from "../../services/saveDoctor";
import { saveImage } from "../../services/saveImage";
import { savePatient } from "../../services/savePatient";
import { getAddress } from "../../services/viaCep";
import {
    RegionalCouncilIdToName,
    RegionalCouncilList,
    RegionalCouncilNameToId,
} from "../../utils/enum/council.enum";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { formatDateyyyyMMdd } from "../../utils/formatDateyyyyMMdd";
import { removeMask } from "../../utils/removeMask";
import { ufs } from "../../utils/uf";
import { validateEmail } from "../../utils/validateEmail";
import { BoxTitle } from "../BoxTitle";
import { Button } from "../Button";
import { CompanyLogo } from "../CompanyLogo";
import { FormError } from "../FormError";
import { Input } from "../Input";
import { InputIcon } from "../InputIcon";
import { ShowPrivacyPolicyModal } from "../PrivacyPolicyModal";
import { Select } from "../Select";
import { Specialty } from "../Specialty";
import { ShowTermOfUseModal } from "../TermOfUseModal";
import { ToastMessage } from "../ToastMessage";
import { checkAdminByCPF } from "../../services/checkAdminByCPF";
YupPassword(Yup); // extend yup

interface Props {
    isDoctorCreation?: boolean;
    isAdminCreation?: boolean;
    buttonMessage: string | ReactNode;
    setPatient?: React.Dispatch<React.SetStateAction<undefined | IListPatient>>;
    doctorId?: number;
    closeListModal?: () => void;
    findPatient?: (query: string) => Promise<void>;
}

const emptySpeciality = {
    specialty: "",
    registrationNumber: "",
};

export function CreateUserModal({
    // Criação de doutor ou paciente
    isDoctorCreation = false,
    // Diz se é um admin ou não que está criando o doutor, apenas usada para gerenciar qual botão retornar.
    isAdminCreation = false,
    buttonMessage,
    doctorId,
    setPatient,
    closeListModal,
    findPatient,
}: Props) {
    const account = useAccount();
    const modalTitle = isAdminCreation
        ? "Novo profissional"
        : isDoctorCreation
        ? "Nova conta"
        : `Novo ${
              Number(account.councilId) === 2 ? "proprietário" : "paciente"
          }`;
    const [blockButton, setBlockButton] = useState(false);

    const initialValuesFormik: any = {
        cpf: "",
        crm: "",
        name: "",
        socialName: "",
        birthDate: undefined as any,
        email: "",
        phoneNumber: "",
        personType: isDoctorCreation
            ? PersonTypeEnum.DOCTOR
            : PersonTypeEnum.PATIENT,
        mothersName: "",
        councilType: "",
        councilUf: "",
        sex: "",
        responsibleSocialName: "",
        responsibleName: "",
        responsibleCPF: "",
        responsibleBirthDate: undefined as any,
        responsibleMothersName: "",
        responsibleSex: "",
        hasResponsible: false,
        address: {
            cep: "",
            city: "",
            district: "",
            street: "",
            number: "",
            complement: "",
            state: "",
            cnpj: "",
            isDefault: true,
            ownerName: "",
            ownerEmail: "",
            ownerPhone: "",
            ownerPhone2: "",
        },
        doctorSpecialty: [
            {
                specialty: "",
                registrationNumber: "",
            },
        ],
        password: "",
        confirmationPassword: "",
    };
    const { isOpen, onOpen, onClose } = useDisclosure();
    const addressTitle = isDoctorCreation ? "Endereço da empresa" : "Endereço";
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [id, setId] = useState<number>();
    const [disableByCEP, setDisableByCEP] = useState(false);
    const [image, setImage] = useState<any>([]);
    const [councilType, setCouncilType] = useState<string>("");

    async function getInfoByCPF(cpf: string, isResponsible = false) {
        try {
            if (!isDoctorCreation && !isResponsible) {
                const result = await getPatientByCPF(
                    removeMask.cpf(cpf),
                    Number(doctorId),
                );

                if (result) {
                    if (result.hasResponsible) {
                        await formik.setValues({
                            birthDate: formatDateyyyyMMdd(result?.birthDate),
                            email: result?.email,
                            mothersName: result?.mothersName,
                            name: result?.name,
                            personType: result?.personType,
                            phoneNumber: result?.phoneNumber,
                            socialName: result?.socialName,
                            cpf: result?.cpf,
                            sex: result?.sex,
                            responsibleSocialName: result.responsibleSocialName
                                ? result.responsibleSocialName
                                : "",
                            responsibleName: result.responsibleName,
                            responsibleCPF: result.responsibleCPF,
                            hasResponsible: result.hasResponsible,
                            address: {
                                cep: result?.address?.cep,
                                city: result?.address?.city,
                                complement: result?.address?.complement,
                                district: result?.address?.district,
                                number: result?.address?.number,
                                ownerEmail:
                                    result?.address?.ownerEmail || undefined,
                                ownerName: result?.address?.ownerEmail,
                                ownerPhone: result?.address?.ownerPhone,
                                ownerPhone2: result?.address?.ownerPhone2,
                                state: result?.address?.state,
                                street: result?.address?.street,
                            },
                        });
                    } else {

                        await formik.setValues({
                            birthDate: formatDateyyyyMMdd(result?.birthDate),
                            email: result?.email,
                            mothersName: result?.mothersName,
                            name: result?.name,
                            personType: result?.personType,
                            phoneNumber: result?.phoneNumber,
                            socialName: result?.socialName,
                            cpf: result?.cpf,
                            sex: result?.sex,
                            address: {
                                cep: result?.address?.cep,
                                city: result?.address?.city,
                                complement: result?.address?.complement,
                                district: result?.address?.district,
                                number: result?.address?.number,
                                ownerEmail:
                                    result?.address?.ownerEmail || undefined,
                                ownerName: result?.address?.ownerEmail,
                                ownerPhone: result?.address?.ownerPhone,
                                ownerPhone2: result?.address?.ownerPhone2,
                                state: result?.address?.state,
                                street: result?.address?.street,
                            },
                        });
                    }
                }

                if (!result) {
                    const receitaApi = await receitaCpfApi(removeMask.cpf(cpf));
                    if (receitaApi.nome && !isResponsible) {
                        await formik.setFieldValue("name", receitaApi.nome);
                    } else if (receitaApi.nome && isResponsible) {
                        await formik.setFieldValue(
                            "responsibleName",
                            receitaApi.nome,
                        );
                    }
                }
            } else {
                const result = await checkAdminByCPF(removeMask.cpf(cpf));
                if (result) {
                    await formik.setValues({
                        cpf: String(result.cpf),
                        name: String(result.name),
                        sex: String(result.sex),
                        birthDate: formatDateyyyyMMdd(
                            String(result?.birthDate),
                        ),
                        socialName: String(result.socialName),
                        email: String(result.email),
                        phoneNumber: String(result.phoneNumber),
                        mothersName: String(result.mothersName),
                        personType: 2,
                        approve: true,
                        password: "",
                        confirmationPassword: "",
                        address: {
                            state: "",
                            cep: "",
                            city: "",
                            district: "",
                            street: "",
                            number: "",
                        },
                    });
                }
                if (!result) {
                    const receitaApi = await receitaCpfApi(removeMask.cpf(cpf));
                    if (receitaApi.nome && !isResponsible) {
                        await formik.setFieldValue("name", receitaApi.nome);
                    } else if (receitaApi.nome && isResponsible) {
                        await formik.setFieldValue(
                            "responsibleName",
                            receitaApi.nome,
                        );
                    }
                }
            }
            forceUpdate();
        } catch (error: any) {
            console.log(error);
            let message;
            if (error.response?.data?.erro) {
                message = `Retorno da API de consulta CPF diz: ${error.response?.data?.erro}`;
            } else if (error?.title) {
                message = error?.title;
            } else {
                message =
                    "Erro desconhecido ao consultar CPF, por favor tente novamente!";
            }

            toast.error(<ToastMessage title="Erro!" description={message} />);
        }
    }

    async function getDoctorId() {
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        setId(Number(docId));
    }

    useEffect(() => {
        void getDoctorId();
        formik.resetForm();
    }, []);

    async function handleGetAddres(value: string) {
        const result = await getAddress(value);
        if (!Object.prototype.hasOwnProperty.call(result, "erro")) {
            setDisableByCEP(true);
        } else {
            await formik.setFieldValue("address.cep", "");

            toast.error(
                <ToastMessage
                    title="Erro"
                    description="CEP inexistente, por favor adicione um cep válido."
                />,
            );
        }

        await formik.setFieldValue("address.city", result.localidade);
        await formik.setFieldValue("address.district", result.bairro);
        await formik.setFieldValue("address.street", result.logradouro);
        await formik.setFieldValue("address.complement", result.complemento);
        await formik.setFieldValue("address.state", result.uf);
    }

    function handleChangeCEP(value: string) {
        const cep = value
            .replace("-", "")
            .replaceAll("_", "")
            .replaceAll(" ", "");
        if (cep.length === 8) {
            void handleGetAddres(cep);
        } else {
            setDisableByCEP(false);
        }
    }

    const councilValidation = {
        councilType: Yup.string().required("O conselho é obrigatório"),
        councilUf: Yup.string().required("A UF do conselho é obrigatória"),
        crm: Yup.number().required("O número do conselho é obrigatório"),
    };

    const doctorSpecialtyValidation = {
        doctorSpecialty: Yup.array().of(
            Yup.object().shape({
                registrationNumber: Yup.string(),
                specialty: Yup.string(),
            }),
        ),
    };

    const passValidation = {
        password: Yup.string()
            .min(8, "A senha deve ter no mínimo 8 caracteres")
            .minLowercase(
                1,
                "A senha deve conter no mínimo uma letra minúscula",
            )
            .minUppercase(
                1,
                "A senha deve conter no mínimo uma letra maiúscula",
            )
            .minNumbers(1, "A senha deve conter no mínimo um número")
            .minSymbols(
                1,
                "A senha deve conter no mínimo um caractere especial",
            )
            .required("A senha é obrigatória"),
        confirmationPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "As senhas devem ser iguais")
            .required("A confirmação da senha é obrigatória"),
    };

    const validationSchema = Yup.object().shape({
        address: Yup.object().shape({
            cep: isDoctorCreation
                ? Yup.string()
                      .min(9)
                      .required("O CEP é obrigatório")
                      .test("is-cep", "CEP inválido", (value) =>
                          isCEP(String(value)),
                      )
                : Yup.string(),
            city: isDoctorCreation
                ? Yup.string().required("A cidade  ade é obrigatório")
                : Yup.string(),
            district: isDoctorCreation
                ? Yup.string().required("O bairro é obrigatório")
                : Yup.string(),
            street: isDoctorCreation
                ? Yup.string().required("A rua é obrigatório")
                : Yup.string(),
            number: isDoctorCreation
                ? Yup.string().required("O número é obrigatório")
                : Yup.string(),
            state: isDoctorCreation
                ? Yup.string().required("A UF é obrigatório")
                : Yup.string(),
            cnpj: isDoctorCreation ? Yup.string() : Yup.string(),
            ownerName: isDoctorCreation
                ? Yup.string().required("O nome fantasia é obrigatório.")
                : Yup.string(),
            ownerEmail: isDoctorCreation ? Yup.string() : Yup.string(),
            ownerPhone: isDoctorCreation
                ? Yup.string()
                      .nullable()
                      .transform((value, originalValue) =>
                          originalValue.trim() === "" ? null : value,
                      )
                      .test(
                          "len",
                          "O telefone precisa ter no mínimo 10 caracteres",
                          (value) => !value || value.length >= 11,
                      )
                : Yup.string(),
            ownerPhone2: isDoctorCreation
                ? Yup.string()
                      .nullable()
                      .transform((value, originalValue) =>
                          originalValue.trim() === "" ? null : value,
                      )
                      .test(
                          "len",
                          "O telefone precisa ter no mínimo 10 caracteres",
                          (value) => !value || value.length >= 11,
                      )
                : Yup.string(),
        }),
        name: Yup.string().required("O nome é obrigatório."),
        email: Yup.string().required("O email é obrigatório."),
        birthDate: Yup.string().required("A data de nascimento é obrigatório"),
        sex: Yup.string().required("O sexo é obrigatório."),
        ownerPhone: Yup.string()
            .nullable()
            .transform((value, originalValue) =>
                originalValue.trim() === "" ? null : value,
            )
            .test(
                "len",
                "O telefone precisa ter no mínimo 10 caracteres",
                (value) => !value || value.length >= 11,
            ),
        mothersName: Yup.string(),
        responsibleSocialName: Yup.string(),
        responsibleName: Yup.string(),
        responsibleCPF: Yup.string(),
        hasResponsible: Yup.boolean(),
        responsibleBirthDate: Yup.string(),
        responsibleMothersName: Yup.string(),
        responsibleSex: Yup.string(),
        cpf: Yup.string(),
        ...(isDoctorCreation ? passValidation : {}),
        ...(isDoctorCreation ? councilValidation : {}),
        ...(isDoctorCreation ? doctorSpecialtyValidation : {}),
    });

    const formik = useFormik({
        initialValues: initialValuesFormik,
        validationSchema,
        onSubmit: async (payload: any) => {
            payload.cpf = removeMask.cpf(payload.cpf);
            payload.phoneNumber = removeMask.ownerPhone(payload.phoneNumber);
            try {
                if (isDoctorCreation) {
                    delete payload.confirmationPassword;
                    delete payload.hasResponsible;
                    payload.address.isDefault = true;
                    payload.personType = 2;
                    payload.councilType =
                        RegionalCouncilNameToId[payload.councilType];
                    setBlockButton(true);
                    payload.approve = false;
                    const result = await saveDoctor(payload);
                    if (image.length > 0) {
                        await saveImage(
                            result.address.ownerAddressId,
                            result.doctorId,
                            { data_url: image[0]?.data_url },
                        );
                        setImage([]);
                    }
                    toast.success(
                        <ToastMessage
                            title="Conta criada"
                            description="A conta foi criada com sucesso! Aguardando aprovação do adiministrador."
                        />,
                    );
                    if (
                        typeof closeListModal === "function" &&
                        typeof findPatient === "function"
                    ) {
                        await findPatient("");
                        closeListModal();
                    }
                    setBlockButton(false);
                    setImage([]);
                    formik.resetForm();

                    onClose();
                } else {
                    payload.approve = true;
                    const needAllResponsibleInformation =
                        payload.hasResponsible &&
                        (!payload.responsibleName ||
                            !payload.responsibleCPF ||
                            !payload.responsibleBirthDate ||
                            !payload.responsibleSex);

                    if (needAllResponsibleInformation) {
                        toast.error(
                            <ToastMessage
                                title="Erro!"
                                description={`Verifique as informações do responsável!`}
                            />,
                        );
                        return;
                    }

                    if (
                        payload.hasResponsible &&
                        !isCPF(payload.responsibleCPF)
                    ) {
                        toast.error(
                            <ToastMessage
                                title="Erro!"
                                description={`O CPF do responsável é obrigatório!`}
                            />,
                        );
                        return;
                    }

                    if (!payload.hasResponsible && !isCPF(payload.cpf)) {
                        toast.error(
                            <ToastMessage
                                title="Erro!"
                                description={`O CPF é obrigatório!`}
                            />,
                        );
                        return;
                    }
                    delete payload.crm;
                    delete payload.doctorSpecialty;
                    delete payload.address.ownerEmail;
                    delete payload.address.ownerName;
                    delete payload.address.ownerPhone;
                    delete payload.address.ownerPhone2;
                    delete payload.address.cnpj;
                    delete payload.password;
                    delete payload.confirmationPassword;
                    delete payload.councilType;
                    delete payload.councilUf;
                    payload.personType = 1;
                    payload.idDoctor = id;
                    setBlockButton(true);
                    const result = await savePatient(payload);
                    const patient = await listPatient(
                        Number(doctorId),
                        result.name,
                    );
                    if (typeof setPatient === "function") {
                        setPatient(patient[0]);
                    }
                    toast.success(
                        <ToastMessage
                            title="Sucesso!"
                            description={`${
                                Number(account.councilId) === 2
                                    ? "Proprietário"
                                    : "Paciente"
                            } criado com sucesso!`}
                        />,
                    );
                    if (
                        typeof closeListModal === "function" &&
                        typeof findPatient === "function"
                    ) {
                        await findPatient("");
                        closeListModal();
                    }
                    setBlockButton(false);
                    formik.resetForm();

                    onClose();
                }
            } catch (error: any) {
                if (isDoctorCreation) {
                    payload.councilType =
                        RegionalCouncilIdToName[payload.councilType];
                }
                console.log(error);
                setBlockButton(false);
                toast.error(
                    <ToastMessage
                        title="Erro"
                        description={
                            error?.error?.response.title ||
                            "Erro ao criar conta, tente novamente."
                        }
                    />,
                );
            }
        },
    });

    function canCreate(): boolean {
        let councilIsValid;
        if (!isDoctorCreation) {
            councilIsValid = true;
        } else {
            if (councilType === "CRO – Conselho Regional de Odontologia") {
                councilIsValid = true;
            } else if (
                councilType ===
                "CRMV - Conselho Regional de Medicina Veterinária"
            ) {
                if (Array.isArray(formik.values.doctorSpecialty)) {
                    if (
                        formik.values.doctorSpecialty[0]?.registrationNumber
                            .length > 0
                    ) {
                        councilIsValid = true;
                    }
                }
            } else {
                if (Array.isArray(formik.values.doctorSpecialty)) {
                    const values = formik.values.doctorSpecialty?.filter(
                        (speciality: any) =>
                            String(speciality?.registrationNumber)?.length > 0,
                    );

                    councilIsValid =
                        values?.length ===
                        formik.values?.doctorSpecialty?.length;
                }
            }
        }
        const isValidCPF = formik.values.cpf.length
            ? isCPF(formik.values.cpf)
            : true;
        if (formik.isValid && isValidCPF && councilIsValid) {
            return blockButton;
        } else {
            return true;
        }
    }

    function addSpecialistComponent() {
        if (Array.isArray(formik.values.doctorSpecialty)) {
            formik.values.doctorSpecialty.push(emptySpeciality);
            if (formik.values.doctorSpecialty.length === 1) {
                void formik.validateForm();
            }
            forceUpdate();
        }
    }

    function removeModalSpeciality(index: number) {
        if (
            Array.isArray(formik.initialValues.doctorSpecialty) &&
            Array.isArray(formik.values.doctorSpecialty)
        ) {
            formik.initialValues.doctorSpecialty.splice(index, 1);
            formik.values.doctorSpecialty.splice(index, 1);
            if (formik.values.doctorSpecialty.length === 0) {
                void formik.validateForm();
            }
            forceUpdate();
        }
    }

    function ruleToPatient(): boolean {
        return !!isCPF(formik.values.cpf);
    }

    const crmInput = isDoctorCreation ? (
        <Flex width="100%" direction="column" display="block">
            <Input
                width="100%"
                placeholder="Número do Conselho"
                value={formik.values.crm}
                onChange={(e: any) => {
                    if (
                        String(formik.values.crm).length < 10 ||
                        e.target.value.length < 10
                    ) {
                        formik.handleChange(e);
                    }
                }}
                id="crm"
                name="crm"
                type="number"
                maxLength={10}
            />
            <FormError message={String(formik.errors?.crm)} />
        </Flex>
    ) : null;

    const motherNameInput = isDoctorCreation ? null : (
        <Flex width="100%" direction="column" display="block">
            <Input
                width="100%"
                placeholder="Nome da mãe"
                value={formik.values.mothersName}
                onChange={formik.handleChange}
                id="mothersName"
                name="mothersName"
            />
            <FormError message={String(formik.errors?.mothersName)} />
        </Flex>
    );

    const councilInputSelect = isDoctorCreation ? (
        <Flex width="100%" direction="column" display="block">
            <Select
                placeholder="Conselho Regional"
                options={RegionalCouncilList}
                value={formik.values.councilType}
                id="councilType"
                name="councilType"
                onChange={async (e: any) => {
                    formik.handleChange(e);
                    setCouncilType(e.target.value);
                    await formik.validateForm();
                    if (Array.isArray(formik.values.doctorSpecialty)) {
                        formik.values.doctorSpecialty?.forEach(
                            async (_: any, index: number) => {
                                await formik.validateField(
                                    `doctorSpecialty[${index}].registrationNumber`,
                                );
                            },
                        );
                    }
                    forceUpdate();
                }}
                width="100%"
            />
            <FormError message={String(formik.errors?.councilType)} />
        </Flex>
    ) : null;

    const councilUFInputSelect = isDoctorCreation ? (
        <Flex width="100%" direction="column" display="block">
            <Select
                placeholder="UF do Conselho"
                options={ufs}
                value={formik.values.councilUf}
                id="councilUf"
                name="councilUf"
                onChange={formik.handleChange}
                width="100%"
            />
            <FormError message={String(formik.errors?.councilUf)} />
        </Flex>
    ) : null;

    const passwordInput = isDoctorCreation ? (
        <Box
            backgroundColor={"#F7F8FA"}
            padding="15px"
            width="100%"
            marginBottom="20px"
        >
            <BoxTitle text="Crie uma senha" />
            <Flex width="100%" direction={{ base: "column", md: "row" }}>
                <Flex width="100%" direction="column" display="block">
                    <InputIcon
                        width="100%"
                        placeholder="Senha"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        id="password"
                        name="password"
                    />
                    <FormError message={String(formik.errors?.password)} />
                </Flex>

                <Flex width="100%" direction="column" display="block">
                    <InputIcon
                        width="100%"
                        placeholder="Confirmação de senha"
                        value={formik.values.confirmationPassword}
                        onChange={formik.handleChange}
                        id="confirmationPassword"
                        name="confirmationPassword"
                    />
                    <FormError
                        message={String(formik.errors?.confirmationPassword)}
                    />
                </Flex>
            </Flex>
        </Box>
    ) : null;

    const sexInput = (
        <Flex width="100%" direction="column" display="block">
            <Select
                width="100%"
                placeholder="Sexo biológico"
                options={["Masculino", "Feminino"]}
                id="sex"
                name="sex"
                value={formik.values.sex}
                onChange={formik.handleChange}
            />
            <FormError message={String(formik.errors?.sex)} />
        </Flex>
    );

    const companyAddress = isDoctorCreation ? (
        <Box
            backgroundColor={"#F7F8FA"}
            padding="15px"
            width="100"
            marginBottom="20px"
        >
            <BoxTitle text="Dados da empresa" />
            <Flex
                flexDirection="column"
                minHeight="100px"
                width="100%"
                justifyContent="space-evenly"
            >
                <Flex width="100%" direction="column" display="block">
                    <Input
                        width="100%"
                        placeholder="Nome fantasia"
                        value={formik.values.address.ownerName}
                        onChange={formik.handleChange}
                        id="address.ownerName"
                        name="address.ownerName"
                    />
                    <FormError
                        message={String(
                            getIn(formik.errors, "address.ownerName"),
                        )}
                    />
                </Flex>
                <Flex direction={{ base: "column", md: "row" }}>
                    <Flex width="100%" direction="column" display="block">
                        <Input
                            width={{ base: "100%", md: "98%" }}
                            placeholder="CNPJ"
                            value={formik.values.address.cnpj}
                            onChange={formik.handleChange}
                            id="address.cnpj"
                            name="address.cnpj"
                            type="text"
                            errorMessage="CNPJ Inválido"
                            mask="99.999.999/9999-99"
                        />
                        <FormError
                            message={String(
                                getIn(formik.errors, "address.cnpj"),
                            )}
                        />
                    </Flex>

                    <Flex width="100%" direction="column" display="block">
                        <Input
                            width="100%"
                            placeholder="E-mail"
                            value={formik.values.address.ownerEmail}
                            onChange={formik.handleChange}
                            id="address.ownerEmail"
                            name="address.ownerEmail"
                            errorMessage="E-mail Inválido"
                        />
                        <FormError
                            message={String(
                                getIn(formik.errors, "address.ownerEmail"),
                            )}
                        />
                    </Flex>
                </Flex>
                <Flex direction={{ base: "column", md: "row" }}>
                    <Flex width="100%" direction="column" display="block">
                        <Input
                            width={{ base: "100%", md: "98%" }}
                            placeholder="Telefone 1"
                            value={formik.values.address.ownerPhone}
                            onChange={formik.handleChange}
                            id="address.ownerPhone"
                            name="address.ownerPhone"
                            mask={"(99) 999999999"}
                        />
                        <FormError
                            message={String(
                                getIn(formik.errors, "address.ownerPhone"),
                            )}
                        />
                    </Flex>

                    <Flex width="100%" direction="column" display="block">
                        <Input
                            width="100%"
                            placeholder="Telefone 2"
                            value={formik.values.address.ownerPhone2}
                            onChange={formik.handleChange}
                            id="address.ownerPhone2"
                            name="address.ownerPhone2"
                            mask={"(99) 999999999"}
                        />

                        <FormError
                            message={String(
                                getIn(formik.errors, "address.ownerPhone2"),
                            )}
                        />
                    </Flex>
                </Flex>
            </Flex>
        </Box>
    ) : null;

    return (
        <>
            <Text
                onClick={onOpen}
                _hover={{
                    cursor: "pointer",
                }}
            >
                {buttonMessage}
            </Text>
            <Modal
                onClose={() => {
                    formik.resetForm();
                    onClose();
                }}
                isOpen={isOpen}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <form onSubmit={formik.handleSubmit}>
                        <ModalHeader>{modalTitle}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody padding={0} height="100%">
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100"
                                marginBottom="20px"
                            >
                                <BoxTitle text="Informações Pessoais" />
                                <Flex
                                    flexDirection="column"
                                    minHeight="100px"
                                    width="100%"
                                    justifyContent="space-evenly"
                                >
                                    <Flex
                                        direction={{
                                            base: "column",
                                            md: "row",
                                        }}
                                        justifyContent={{
                                            base: "space-evely",
                                            md: "center",
                                        }}
                                    >
                                        <Box
                                            width="100%"
                                            mr={{ base: 0, md: "6px" }}
                                        >
                                            <Input
                                                width={{
                                                    base: "100%",
                                                    md: "100%",
                                                }}
                                                placeholder="CPF"
                                                value={formik.values.cpf}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                ) => {
                                                    formik.handleChange(e);
                                                    if (isCPF(e.target.value)) {
                                                        void getInfoByCPF(
                                                            e.target.value,
                                                        );
                                                    }
                                                }}
                                                id="cpf"
                                                name="cpf"
                                                type="text"
                                                errorMessage="CPF Inválido"
                                                mask="999.999.999-99"
                                                validation={
                                                    !isCPF(
                                                        String(
                                                            formik.values.cpf,
                                                        ),
                                                    )
                                                }
                                            />
                                            <FormError
                                                message={String(
                                                    formik.errors?.cpf,
                                                )}
                                            />
                                        </Box>

                                        {councilInputSelect}
                                    </Flex>
                                    {!isDoctorCreation &&
                                    Number(account.councilId) !== 2 ? (
                                        <Box
                                            width="100%"
                                            mr={{ base: 0, md: "6px" }}
                                        >
                                            <Checkbox
                                                ml="10px"
                                                colorScheme="red"
                                                id="hasResponsible"
                                                name="hasResponsible"
                                                isChecked={
                                                    formik.values.hasResponsible
                                                }
                                                onChange={formik.handleChange}
                                                value={
                                                    formik.values.hasResponsible
                                                }
                                            >
                                                <Text color="#7D899D">
                                                    Paciente menor
                                                </Text>
                                            </Checkbox>
                                        </Box>
                                    ) : null}
                                    <Flex
                                        direction={{
                                            base: "column",
                                            md: "row",
                                        }}
                                        justifyContent={{
                                            base: "space-evely",
                                            md: "center",
                                        }}
                                    >
                                        <Box
                                            width="100%"
                                            mr={{ base: 0, md: "6px" }}
                                        >
                                            {councilUFInputSelect}
                                        </Box>
                                        {crmInput}
                                    </Flex>

                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            width="100%"
                                            placeholder="Nome completo"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            id="name"
                                            name="name"
                                            disabled={
                                                isDoctorCreation ||
                                                ruleToPatient()
                                            }
                                        />
                                        <FormError
                                            message={String(
                                                formik.errors?.name,
                                            )}
                                        />
                                    </Flex>

                                    <Input
                                        width="100%"
                                        placeholder="Nome social"
                                        value={formik.values.socialName}
                                        onChange={formik.handleChange}
                                        id="socialName"
                                        name="socialName"
                                    />

                                    {motherNameInput}

                                    <Box
                                        display={{ base: "block", md: "flex" }}
                                    >
                                        <Box width="100%">
                                            <Flex
                                                width="100%"
                                                direction="column"
                                                display="block"
                                            >
                                                <Input
                                                    width={{
                                                        base: "100%",
                                                        md: "98%",
                                                    }}
                                                    placeholder="Data de nascimento"
                                                    value={
                                                        formik.values.birthDate
                                                    }
                                                    type="date"
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    id="birthDate"
                                                    name="birthDate"
                                                    maxLength={7}
                                                />

                                                <FormError
                                                    message={String(
                                                        formik.errors
                                                            ?.birthDate,
                                                    )}
                                                />
                                            </Flex>
                                        </Box>
                                        <Box
                                            width={{ base: "100%", md: "40%" }}
                                        >
                                            {sexInput}
                                        </Box>
                                    </Box>
                                </Flex>
                            </Box>

                            {!isDoctorCreation &&
                            formik.values.hasResponsible ? (
                                <Box
                                    backgroundColor={"#F7F8FA"}
                                    padding="15px"
                                    width="100"
                                    marginBottom="20px"
                                >
                                    <BoxTitle text="Informações do responsável" />

                                    <Box
                                        width="100%"
                                        mr={{ base: 0, md: "6px" }}
                                    >
                                        <Input
                                            width={{
                                                base: "100%",
                                                md: "100%",
                                            }}
                                            placeholder="CPF"
                                            value={formik.values.responsibleCPF}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) => {
                                                formik.handleChange(e);
                                                if (isCPF(e.target.value)) {
                                                    void getInfoByCPF(
                                                        e.target.value,
                                                        true,
                                                    );
                                                }
                                            }}
                                            id="responsibleCPF"
                                            name="responsibleCPF"
                                            type="text"
                                            errorMessage="CPF Inválido"
                                            mask="999.999.999-99"
                                            validation={
                                                !isCPF(
                                                    String(
                                                        formik.values
                                                            .responsibleCPF,
                                                    ),
                                                )
                                            }
                                        />
                                        <FormError
                                            message={String(
                                                formik.errors?.responsibleCPF,
                                            )}
                                        />
                                    </Box>

                                    <Box
                                        width="100%"
                                        mr={{ base: 0, md: "6px" }}
                                    >
                                        <Input
                                            width={{
                                                base: "100%",
                                                md: "100%",
                                            }}
                                            placeholder="Nome completo"
                                            value={
                                                formik.values.responsibleName
                                            }
                                            disabled
                                            onChange={formik.handleChange}
                                            id="responsibleName"
                                            name="responsibleName"
                                            type="text"
                                        />
                                        <FormError
                                            message={String(
                                                formik.errors?.responsibleName,
                                            )}
                                        />
                                    </Box>
                                    <Box
                                        width="100%"
                                        mr={{ base: 0, md: "6px" }}
                                    >
                                        <Input
                                            width={{
                                                base: "100%",
                                                md: "100%",
                                            }}
                                            placeholder="Nome social"
                                            value={
                                                formik.values
                                                    .responsibleSocialName
                                            }
                                            onChange={formik.handleChange}
                                            id="responsibleSocialName"
                                            name="responsibleSocialName"
                                            type="text"
                                        />
                                        <FormError
                                            message={String(
                                                formik.errors
                                                    ?.responsibleSocialName,
                                            )}
                                        />
                                    </Box>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Select
                                            width="100%"
                                            placeholder="Sexo biológico"
                                            options={["Masculino", "Feminino"]}
                                            id="responsibleSex"
                                            name="responsibleSex"
                                            value={formik.values.responsibleSex}
                                            onChange={formik.handleChange}
                                        />
                                        <FormError
                                            message={String(
                                                formik.errors?.responsibleSex,
                                            )}
                                        />
                                    </Flex>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            width={{
                                                base: "100%",
                                                md: "100%",
                                            }}
                                            placeholder="Data de nascimento"
                                            value={
                                                formik.values
                                                    .responsibleBirthDate
                                            }
                                            type="date"
                                            onChange={formik.handleChange}
                                            id="responsibleBirthDate"
                                            name="responsibleBirthDate"
                                            maxLength={7}
                                        />

                                        <FormError
                                            message={String(
                                                formik.errors
                                                    ?.responsibleBirthDate,
                                            )}
                                        />
                                    </Flex>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            width="100%"
                                            placeholder="Nome da mãe"
                                            value={
                                                formik.values
                                                    .responsibleMothersName
                                            }
                                            onChange={formik.handleChange}
                                            id="responsibleMothersName"
                                            name="responsibleMothersName"
                                        />
                                        <FormError
                                            message={String(
                                                formik.errors
                                                    ?.responsibleMothersName,
                                            )}
                                        />
                                    </Flex>
                                </Box>
                            ) : null}

                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100%"
                                marginBottom="20px"
                            >
                                <BoxTitle text="Contato" />
                                <Flex
                                    flexDirection="column"
                                    minHeight="100%"
                                    width={{ base: "100%", md: "100%" }}
                                    justifyContent="space-evenly"
                                >
                                    <Box
                                        display={{ base: "block", md: "flex" }}
                                    >
                                        <Box width="100%">
                                            <Flex
                                                width="100%"
                                                direction="column"
                                                display="block"
                                            >
                                                <Input
                                                    width={{
                                                        base: "100%",
                                                        md: "98%",
                                                    }}
                                                    placeholder="E-mail"
                                                    value={formik.values.email}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    id="email"
                                                    name="email"
                                                    errorMessage="E-mail Inválido"
                                                    validation={
                                                        !validateEmail(
                                                            formik.values.email,
                                                        )
                                                    }
                                                />
                                                <FormError
                                                    message={String(
                                                        formik.errors?.email,
                                                    )}
                                                />
                                            </Flex>
                                        </Box>
                                        <Box
                                            width={{ base: "100%", md: "100%" }}
                                            mr={{ base: 0, md: "2px" }}
                                        >
                                            <Flex
                                                width="100%"
                                                direction="column"
                                                display="block"
                                            >
                                                <Input
                                                    width="100%"
                                                    placeholder="Celular"
                                                    value={
                                                        formik.values
                                                            .phoneNumber
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    id="phoneNumber"
                                                    mask={"(99) 999999999"}
                                                    name="phoneNumber"
                                                />
                                                <FormError
                                                    message={String(
                                                        formik.errors
                                                            ?.phoneNumber,
                                                    )}
                                                />
                                            </Flex>
                                        </Box>
                                    </Box>
                                </Flex>
                            </Box>
                            {isDoctorCreation
                                ? Array.isArray(
                                      formik.values?.doctorSpecialty,
                                  ) &&
                                  formik.values?.doctorSpecialty?.map(
                                      (_: any, index: number) => (
                                          <Specialty
                                              key={index}
                                              reqHandleChange={
                                                  formik.handleChange
                                              }
                                              rqeId={`doctorSpecialty[${index}].registrationNumber`}
                                              rqeValue={
                                                  formik.values.doctorSpecialty[
                                                      index
                                                  ].registrationNumber
                                              }
                                              specialityNameHandleChange={
                                                  formik.handleChange
                                              }
                                              specialityId={`doctorSpecialty[${index}].specialty`}
                                              specialityNameValue={
                                                  formik.values
                                                      ?.doctorSpecialty[index]
                                                      .specialty
                                              }
                                              removeSpecialityModalFunction={() =>
                                                  removeModalSpeciality(index)
                                              }
                                              rqeError={""}
                                              specialityError={getIn(
                                                  formik.errors,
                                                  `doctorSpecialty[${index}].specialty`,
                                              )}
                                              council={councilType}
                                              index={index}
                                          />
                                      ),
                                  )
                                : null}

                            {isDoctorCreation ? (
                                <Box marginTop="10px" marginBottom="10px">
                                    <Text
                                        fontWeight={800}
                                        color="#7D899D"
                                        fontSize="12px"
                                        textDecorationLine="underline"
                                        textAlign={"center"}
                                        _hover={{
                                            cursor: "pointer",
                                        }}
                                        onClick={addSpecialistComponent}
                                    >
                                        Adicionar especialidade
                                    </Text>
                                </Box>
                            ) : null}

                            {companyAddress}
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100"
                                marginBottom="20px"
                            >
                                <BoxTitle text={addressTitle} />
                                <Flex
                                    flexDirection="column"
                                    minHeight="100px"
                                    width="100%"
                                    justifyContent="space-evenly"
                                >
                                    <Flex>
                                        <Flex
                                            width="100%"
                                            direction="column"
                                            display="block"
                                        >
                                            <Input
                                                placeholder="CEP"
                                                value={
                                                    formik.values.address.cep
                                                }
                                                onChange={(e: any) => {
                                                    formik.handleChange(e);
                                                    handleChangeCEP(
                                                        e.target.value,
                                                    );
                                                }}
                                                id="address.cep"
                                                name="address.cep"
                                                width="98%"
                                                mask="99999-999"
                                            />
                                            <FormError
                                                message={String(
                                                    getIn(
                                                        formik.errors,
                                                        "address.cep",
                                                    ),
                                                )}
                                            />
                                        </Flex>
                                        <Flex
                                            width="35%"
                                            direction="column"
                                            display="block"
                                        >
                                            <Select
                                                placeholder="UF"
                                                options={ufs}
                                                value={
                                                    formik.values.address.state
                                                }
                                                id="address.state"
                                                name="address.state"
                                                onChange={formik.handleChange}
                                                width="100%"
                                                disabled={disableByCEP}
                                            />
                                            <FormError
                                                message={String(
                                                    getIn(
                                                        formik.errors,
                                                        "address.state",
                                                    ),
                                                )}
                                            />
                                        </Flex>
                                    </Flex>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="Rua"
                                            value={formik.values.address.street}
                                            onChange={formik.handleChange}
                                            id="address.street"
                                            name="address.street"
                                            onBlur={formik.handleBlur}
                                            maxLength={95}
                                        />
                                        <FormError
                                            message={String(
                                                getIn(
                                                    formik.errors,
                                                    "address.street",
                                                ),
                                            )}
                                        />
                                    </Flex>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="Cidade"
                                            value={formik.values.address.city}
                                            onChange={formik.handleChange}
                                            id="address.city"
                                            name="address.city"
                                            disabled={disableByCEP}
                                            maxLength={35}
                                        />
                                        <FormError
                                            message={String(
                                                getIn(
                                                    formik.errors,
                                                    "address.city",
                                                ),
                                            )}
                                        />
                                    </Flex>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="Bairro"
                                            value={
                                                formik.values.address.district
                                            }
                                            onChange={formik.handleChange}
                                            id="address.district"
                                            name="address.district"
                                            errorMessage="O campo Bairro é obrigatório."
                                            validation={
                                                formik.values.district === ""
                                            }
                                            maxLength={50}
                                        />
                                        <FormError
                                            message={String(
                                                getIn(
                                                    formik.errors,
                                                    "address.district",
                                                ),
                                            )}
                                        />
                                    </Flex>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="Número"
                                            value={formik.values.address.number}
                                            onChange={formik.handleChange}
                                            id="address.number"
                                            name="address.number"
                                            errorMessage="O campo Número é obrigatório."
                                            validation={
                                                formik.values.number === ""
                                            }
                                            maxLength={10}
                                        />
                                        <FormError
                                            message={String(
                                                getIn(
                                                    formik.errors,
                                                    "address.number",
                                                ),
                                            )}
                                        />
                                    </Flex>
                                    <Input
                                        placeholder="Complemento"
                                        value={formik.values.address.complement}
                                        onChange={formik.handleChange}
                                        id="address.complement"
                                        name="address.complement"
                                        maxLength={20}
                                    />
                                </Flex>
                            </Box>
                            {isDoctorCreation ? (
                                <CompanyLogo
                                    setImage={setImage}
                                    image={image}
                                />
                            ) : null}

                            {passwordInput}

                            {isDoctorCreation ? (
                                <Box>
                                    <Center
                                        flexDirection={{
                                            base: "column",
                                            md: "row",
                                        }}
                                        justifyContent="center"
                                    >
                                        <Text
                                            fontSize={10}
                                            color="gray.100"
                                            fontWeight={800}
                                        >
                                            Ao continuar você concorda com os{" "}
                                            {"  "}
                                        </Text>
                                        <Text
                                            fontSize={10}
                                            color="gray.100"
                                            fontWeight={800}
                                            ml={{ md: "2px" }}
                                        >
                                            <ShowTermOfUseModal />
                                            <ShowPrivacyPolicyModal />.
                                        </Text>
                                    </Center>
                                </Box>
                            ) : null}
                        </ModalBody>
                        <ModalFooter
                            borderTopColor="gray.500"
                            borderTopWidth="1px"
                            mt={"40px"}
                        >
                            <Box width={{ base: "100%", md: "127px" }}>
                                <Button
                                    disable={canCreate()}
                                    width={"100%"}
                                    height={"47px"}
                                    variant="solid"
                                    hasIcon={false}
                                    bgColor="red.100"
                                    text="Continuar"
                                    textColor="#FFFFFF"
                                    type="submit"
                                    fontSize={14}
                                    isLoading={blockButton}
                                />
                            </Box>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
}
