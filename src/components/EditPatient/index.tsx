import {
    Box,
    Button as ChakraButton,
    Center,
    Checkbox,
    Flex,
    MenuItem,
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
import { formatToCPF, isCPF } from "brazilian-values";
import { useFormik } from "formik";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useAccount } from "../../contexts/accountContext";
import { IListPatient } from "../../interfaces/patient/create.patient.dto";
import { IPatientDto } from "../../interfaces/patient/patient.dto";
import { IUpdatePatientById } from "../../interfaces/patient/update.patient.dto";
import { getPatientByCPF } from "../../services/getPatientByCPF";
import { getPatientById } from "../../services/getPatientById";
import { receitaCpfApi } from "../../services/receitaCpfApi";
import { updatePatient } from "../../services/updatePatient";
import { getAddress } from "../../services/viaCep";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { formatDateyyyyMMdd } from "../../utils/formatDateyyyyMMdd";
import { removeMask } from "../../utils/removeMask";
import { ufs } from "../../utils/uf";
import { BoxTitle } from "../BoxTitle";
import { Button } from "../Button";
import { FormError } from "../FormError";
import { Input } from "../Input";
import { Select } from "../Select";
import { ToastMessage } from "../ToastMessage";
interface Props {
    patient: IListPatient;
    setPatient: React.Dispatch<React.SetStateAction<IListPatient | undefined>>;
    isMenuList: boolean;
}

export default function EditPatient({
    patient,
    setPatient,
    isMenuList,
}: Props) {
    const account = useAccount();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [patientFullInfo, setPatientFullInfo] = useState<IPatientDto>();
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [disableByCEP, setDisableByCEP] = useState(false);
    const [doctorId, setDoctorId] = useState<number>();
    const [blockButton, setBlockButton] = useState(false);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("O nome é obrigatório."),
        email: Yup.string().required("O email é obrigatório."),
        birthDate: Yup.string().required("A data de nascimento é obrigatório"),
        sex: Yup.string(),
        phoneNumber: Yup.string().required("O número é obrigatório")
            .transform((value, originalValue) =>
                originalValue.trim() === "" ? null : value,
            )
            .test(
                "len",
                "O número precisa ter no mínimo 10 caracteres",
                (value) => !value || value.length >= 11,
            ),
        mothersName: Yup.string(),
        cpf: Yup.string(),
        responsibleSocialName: Yup.string(),
        responsibleName: Yup.string(),
        responsibleCPF: Yup.string(),
        responsibleBirthDate: Yup.string().nullable(),
        responsibleMothersName: Yup.string(),
        responsibleSex: Yup.string().nullable(),
        hasResponsible: Yup.boolean(),
        address: Yup.object().shape({
            cep: Yup.string().min(9),
            state: Yup.string(),
            city: Yup.string(),
            street: Yup.string(),
            district: Yup.string(),
            number: Yup.string(),
        }),
    });

    async function getInfoByCPF(cpf: string, isResponsible = false) {
        try {
            let result: IPatientDto | undefined;

            if (result && !isResponsible) {
                result = await getPatientByCPF(
                    removeMask.cpf(cpf),
                    Number(doctorId),
                );
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
                    responsibleSocialName: result.responsibleSocialName,
                    responsibleName: result.responsibleName,
                    responsibleCPF: result.responsibleCPF,
                    hasResponsible: result.hasResponsible,
                    responsibleBirthDate: result.responsibleBirthDate,
                    responsibleMothersName: result.responsibleMothersName,
                    responsibleSex: result.responsibleSex,
                    address: {
                        cep: result?.address?.cep,
                        city: result?.address?.city,
                        complement: result?.address?.complement,
                        district: result?.address?.district,
                        number: result?.address?.number,
                        ownerEmail: result?.address?.ownerEmail,
                        ownerName: result?.address?.ownerEmail,
                        ownerPhone: result?.address?.ownerPhone,
                        state: result?.address?.state,
                        street: result?.address?.street,
                    },
                });
            }

            if (!result) {
                const receitaApi = await receitaCpfApi(removeMask.cpf(cpf));
                if (receitaApi.nome && !isResponsible) {
                    await formik.setFieldValue("name", receitaApi.nome);
                }
                if (receitaApi.nome && isResponsible) {
                    await formik.setFieldValue(
                        "responsibleName",
                        receitaApi.nome,
                    );
                }
            }

            forceUpdate();
        } catch (error: any) {
            console.log(error);

            toast.error(
                <ToastMessage title="Erro!" description={error.title} />,
            );
            if (error.title === "Você já cadastrou esse paciente") {
                await formik.setFieldValue("cpf", "");
            }
        }
    }

    async function getInfoFromPatient() {
        const resultDoctorId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        setDoctorId(Number(resultDoctorId));
        const result = await getPatientById(patient.patientId);
        setPatientFullInfo(result);
        await formik.setValues({
            cpf: result?.cpf,
            name: result?.name,
            mothersName: result?.mothersName,
            birthDate: formatDateyyyyMMdd(result?.birthDate),
            email: result?.email,
            phoneNumber: result?.phoneNumber,
            personType: result?.personType,
            socialName: result?.socialName,
            responsibleSocialName: result.responsibleSocialName,
            responsibleName: result.responsibleName,
            responsibleCPF: result.responsibleCPF,
            hasResponsible: result.hasResponsible,
            responsibleBirthDate: result.responsibleBirthDate
                ? formatDateyyyyMMdd(result.responsibleBirthDate)
                : result.responsibleBirthDate,
            responsibleMothersName: result.responsibleMothersName,
            responsibleSex: result.responsibleSex,
            sex: result.sex,
            address: {
                cep: String(result?.address?.cep),
                city: result?.address?.city,
                district: result?.address?.district,
                street: result?.address?.street,
                number: result?.address?.number,
                complement: result?.address?.complement,
                state: result?.address?.state,
                ownerName: result?.address?.ownerName,
                ownerEmail: result?.address?.ownerEmail,
                ownerPhone: result?.address?.ownerPhone,
            },
        });
        forceUpdate();
    }

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

    useEffect(() => {
        formik.resetForm();
        if (patient && Object.keys(patient).length > 0) {
            void getInfoFromPatient();
        }
    }, [patient]);

    const formik = useFormik({
        initialValues: {
            cpf: patientFullInfo?.cpf,
            name: patientFullInfo?.name,
            mothersName: patientFullInfo?.mothersName,
            birthDate: patientFullInfo?.birthDate,
            email: patientFullInfo?.email,
            phoneNumber: patientFullInfo?.phoneNumber,
            personType: patientFullInfo?.personType,
            socialName: patientFullInfo?.socialName,
            sex: patientFullInfo?.sex,
            responsibleSocialName: patientFullInfo?.responsibleSocialName,
            responsibleName: patientFullInfo?.responsibleName,
            responsibleCPF: patientFullInfo?.responsibleCPF,
            hasResponsible: patientFullInfo?.hasResponsible,
            responsibleBirthDate: patientFullInfo?.responsibleBirthDate
                ? patientFullInfo?.responsibleBirthDate
                : "",
            responsibleMothersName: patientFullInfo?.responsibleMothersName,
            responsibleSex: patientFullInfo?.responsibleSex,
            address: {
                cep: patientFullInfo?.address.cep,
                city: patientFullInfo?.address?.city,
                district: patientFullInfo?.address?.district,
                street: patientFullInfo?.address?.street,
                number: patientFullInfo?.address?.number,
                complement: patientFullInfo?.address?.complement,
                state: patientFullInfo?.address?.state,
                ownerName: patientFullInfo?.address?.ownerName,
                ownerEmail: patientFullInfo?.address?.ownerEmail,
                ownerPhone: patientFullInfo?.address?.ownerPhone,
            },
        },
        validationSchema,
        onSubmit: async (payload: any) => {
            try {
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
                            description={`Todas as informações do responsável são obrigatórias!`}
                        />,
                    );
                    return;
                }
                const result: IUpdatePatientById = {
                    ...payload,
                    personId: patientFullInfo?.personId,
                    patientId: patientFullInfo?.patientId,
                    address: {
                        ...payload.address,
                        addressId: patientFullInfo?.address.addressId,
                        ownerAddressId: patientFullInfo?.address.ownerAddressId,
                    },
                };
                setBlockButton(true);
                await updatePatient(result);
                const updatedPatient = await getPatientById(result.patientId);
                setPatient(updatedPatient as any);
                toast.success(
                    <ToastMessage
                        title="Dados alterados!"
                        description="Seus dados foram salvos e serão utilizados em novas emições de documentos "
                    />,
                );
                account.setIsChange(!account.isChange);
                setBlockButton(false);

                onClose();
            } catch (error) {
                toast.error(
                    <ToastMessage
                        title="Erro!"
                        description="Erro ao alterar o paciente."
                    />,
                );
            }
        },
    });

    async function cleanResponsible() {
        await formik.setFieldValue("responsibleSocialName", "");
        await formik.setFieldValue("responsibleName", "");
        await formik.setFieldValue("responsibleCPF", "");
        await formik.setFieldValue("responsibleBirthDate", "");
        await formik.setFieldValue("responsibleSex", "");
        await formik.setFieldValue("responsibleMothersName", "");
    }

    function canEdit(): boolean {
        const isValidCPF = formik.values?.cpf?.length
            ? isCPF(formik.values.cpf)
            : true;
        if (formik.isValid && isValidCPF) {
            return blockButton;
        } else {
            return true;
        }
    }

    async function openAndGetPatientInfo() {
        await getInfoFromPatient();
        onOpen();
    }
    return (
        <>
            {isMenuList ? (
                <Box
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={openAndGetPatientInfo}
                    width="100%"
                >
                    <ChakraButton
                        height="max-content"
                        margin={0}
                        padding={0}
                        width="100%"
                    >
                        <MenuItem
                            onClick={onOpen}
                            width="100%"
                            _hover={{
                                background: "gray.500",
                            }}
                            _active={{
                                background: "gray.500",
                            }}
                            _focus={{
                                background: "gray.500",
                            }}
                        >
                            <i
                                className="ri-edit-line"
                                style={{ color: "#7D899D" }}
                            ></i>
                            <Text marginLeft="8px">Visualizar / Editar</Text>
                        </MenuItem>
                    </ChakraButton>
                </Box>
            ) : (
                <Center width={{ base: "95%", md: "100%" }}>
                    <Box
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={openAndGetPatientInfo}
                        width="100%"
                        height="72px"
                        border="1px solid #EDEDF3"
                        borderRadius="8px"
                        backgroundColor="#FFFFFF"
                        padding="10px"
                        paddingLeft="20px"
                        _hover={{ cursor: "pointer" }}
                    >
                        <Flex
                            flexDirection="column"
                            flexWrap="wrap"
                            height="100%"
                            justifyContent="space-around"
                            alignItems="flex-start"
                        >
                            <Text fontWeight={900}>{patient?.name}</Text>
                            <Text color="#7D899D">
                                CPF: {formatToCPF(String(patient?.cpf))}
                            </Text>
                            <i
                                className="ri-pencil-line"
                                style={{
                                    color: "#94A0B4",
                                    fontSize: "25px",
                                    alignSelf: "flex-end",
                                    marginRight: "10px",
                                }}
                            ></i>
                        </Flex>
                    </Box>
                </Center>
            )}

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader>
                        Editar{" "}
                        {Number(account.councilId) === 2
                            ? "proprietário"
                            : "paciente"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody padding={0}>
                        <form onSubmit={formik.handleSubmit}>
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100%"
                                marginBottom="20px"
                            >
                                <BoxTitle text="Informações Pessoais" />
                                <Flex
                                    flexDirection="column"
                                    minHeight="100px"
                                    width="100%"
                                    justifyContent="space-evenly"
                                >
                                    <Input
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
                                        disabled={isCPF(
                                            String(patientFullInfo?.cpf),
                                        )}
                                        errorMessage="CPF Inválido"
                                        mask="999.999.999-99"
                                        validation={
                                            !isCPF(String(formik.values.cpf))
                                        }
                                    />
                                    {Number(account.councilId) === 2 ? null : (
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
                                                onChange={(e: any) => {
                                                    formik.handleChange(e);
                                                    void cleanResponsible();
                                                }}
                                            >
                                                <Text color="#7D899D">
                                                    Paciente menor
                                                </Text>
                                            </Checkbox>
                                        </Box>
                                    )}
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="Nome completo"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            id="name"
                                            name="name"
                                            disabled={isCPF(
                                                String(formik.values.cpf),
                                            )}
                                        />
                                        {formik.values.name === "" ? (
                                            <FormError
                                                message={String(
                                                    formik.errors?.name,
                                                )}
                                            />
                                        ) : null}
                                    </Flex>

                                    <Input
                                        placeholder="Nome social"
                                        value={formik.values.socialName}
                                        onChange={formik.handleChange}
                                        id="socialName"
                                        name="socialName"
                                    />
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="Nome da mãe"
                                            value={formik.values.mothersName}
                                            onChange={formik.handleChange}
                                            id="mothersName"
                                            name="mothersName"
                                        />
                                        {formik.values.mothersName === "" ? (
                                            <FormError
                                                message={String(
                                                    formik.errors?.mothersName,
                                                )}
                                            />
                                        ) : null}
                                    </Flex>

                                    <Flex
                                        direction={{
                                            base: "column",
                                            md: "row",
                                        }}
                                    >
                                        <Flex
                                            width="100%"
                                            direction="column"
                                            display="block"
                                        >
                                            <Input
                                                width={{
                                                    base: "100%",
                                                    md: "97%",
                                                }}
                                                placeholder="Data de nascimento"
                                                value={String(
                                                    formik.values.birthDate,
                                                )}
                                                type="date"
                                                onChange={formik.handleChange}
                                                id="birthDate"
                                                name="birthDate"
                                            />
                                            {formik.values.birthDate === "" ? (
                                                <FormError
                                                    message={String(
                                                        formik.errors
                                                            ?.birthDate,
                                                    )}
                                                />
                                            ) : null}
                                        </Flex>
                                        <Flex
                                            width="100%"
                                            direction="column"
                                            display="block"
                                        >
                                            <Select
                                                width="97%"
                                                placeholder="Sexo biológico"
                                                options={[
                                                    "Masculino",
                                                    "Feminino",
                                                ]}
                                                value={formik.values.sex}
                                                id="sex"
                                                name="sex"
                                                onChange={formik.handleChange}
                                            />
                                            {formik.values.sex === "" ? (
                                                <FormError
                                                    message={String(
                                                        formik.errors?.sex,
                                                    )}
                                                />
                                            ) : null}
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Box>
                            {formik.values?.hasResponsible ? (
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
                                            onChange={formik.handleChange}
                                            id="responsibleName"
                                            name="responsibleName"
                                            disabled
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
                                width="100"
                                marginBottom="20px"
                            >
                                <BoxTitle text="Contato" />
                                <Flex
                                    flexDirection="column"
                                    minHeight="100px"
                                    width="100%"
                                    justifyContent="space-evenly"
                                >
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="E-mail"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            id="email"
                                            name="email"
                                        />
                                        {formik.values.email === "" ? (
                                            <FormError
                                                message={String(
                                                    formik.errors?.email,
                                                )}
                                            />
                                        ) : null}
                                    </Flex>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="Celular"
                                            value={formik.values.phoneNumber}
                                            onChange={formik.handleChange}
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            mask={"(99) 999999999"}
                                            />
                                        {formik.values.phoneNumber === "" ? (
                                            <FormError
                                                message={String(
                                                    formik.errors?.phoneNumber,
                                                )}
                                            />
                                        ) : null}
                                    </Flex>
                                </Flex>
                            </Box>
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100"
                                marginBottom="45px"
                            >
                                <BoxTitle text="Endereço" />
                                <Flex
                                    flexDirection="column"
                                    minHeight="100px"
                                    width="100%"
                                    justifyContent="space-evenly"
                                >
                                    <Flex width="100%">
                                        <Flex
                                            flexDirection="column"
                                            flexWrap="wrap"
                                            width="100%"
                                        >
                                            <Input
                                                placeholder="CEP"
                                                value={String(
                                                    formik.values.address.cep,
                                                )}
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
                                            {formik.values.address.cep ===
                                            "" ? (
                                                <FormError
                                                    message={String(
                                                        formik.errors?.address
                                                            ?.cep,
                                                    )}
                                                />
                                            ) : null}
                                        </Flex>
                                        <Flex
                                            flexDirection="column"
                                            flexWrap="wrap"
                                            width="100%"
                                        >
                                            {" "}
                                            <Select
                                                placeholder="UF"
                                                options={ufs}
                                                id="address.state"
                                                name="address.state"
                                                value={
                                                    formik.values.address.state
                                                }
                                                onChange={formik.handleChange}
                                                width="100%"
                                                disabled={disableByCEP}
                                            />
                                            {formik.values.address.state ===
                                            "" ? (
                                                <FormError
                                                    message={String(
                                                        formik.errors?.address
                                                            ?.state,
                                                    )}
                                                />
                                            ) : null}
                                        </Flex>
                                    </Flex>
                                    <Input
                                        placeholder="Rua"
                                        value={formik.values.address.street}
                                        onChange={formik.handleChange}
                                        id="address.street"
                                        name="address.street"
                                        maxLength={95}
                                    />
                                    {formik.values.address.street === "" ? (
                                        <FormError
                                            message={String(
                                                formik.errors?.address?.street,
                                            )}
                                        />
                                    ) : null}
                                    <Input
                                        placeholder="Cidade"
                                        value={formik.values.address.city}
                                        onChange={formik.handleChange}
                                        id="address.city"
                                        name="address.city"
                                        disabled={disableByCEP}
                                        maxLength={35}
                                    />
                                    {formik.values.address.city === "" ? (
                                        <FormError
                                            message={String(
                                                formik.errors?.address?.city,
                                            )}
                                        />
                                    ) : null}
                                    <Input
                                        placeholder="Bairro"
                                        value={formik.values.address.district}
                                        onChange={formik.handleChange}
                                        id="address.district"
                                        name="address.district"
                                        maxLength={50}
                                    />

                                    {formik.values.address.district === "" ? (
                                        <FormError
                                            message={String(
                                                formik.errors?.address
                                                    ?.district,
                                            )}
                                        />
                                    ) : null}
                                    <Input
                                        placeholder="Número"
                                        value={formik.values.address.number}
                                        onChange={formik.handleChange}
                                        id="address.number"
                                        name="address.number"
                                        maxLength={10}
                                    />
                                    {formik.values.address.number === "" ? (
                                        <FormError
                                            message={String(
                                                formik.errors?.address?.number,
                                            )}
                                        />
                                    ) : null}
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
                            <ModalFooter
                                borderTopColor="gray.500"
                                borderTopWidth="1px"
                            >
                                <Box width={{ base: "100%", md: "127px" }}>
                                    <Button
                                        disable={canEdit()}
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
                    </ModalBody>
                    <ModalFooter />
                </ModalContent>
            </Modal>
        </>
    );
}
