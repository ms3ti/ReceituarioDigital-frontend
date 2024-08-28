import {
    Box,
    Flex,
    ListItem,
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
import { isCPF } from "brazilian-values";
import { getIn, useFormik } from "formik";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useAccount } from "../../contexts/accountContext";
import { IDoctorDto } from "../../interfaces/doctor/doctor.dto";
import { IDoctorSpecialityDto } from "../../interfaces/doctor/doctor.speciality.dto";
import { IUpdateDoctorDto } from "../../interfaces/doctor/update.doctor.dto";
import { getDoctorById } from "../../services/getDoctorById";
import { updateDoctor } from "../../services/updateDoctor";
import {
    RegionalCouncilIdToAcronym,
    RegionalCouncilIdToName,
    RegionalCouncilList,
    RegionalCouncilNameToId,
} from "../../utils/enum/council.enum";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { formatDateyyyyMMdd } from "../../utils/formatDateyyyyMMdd";
import { ufs } from "../../utils/uf";
import { BoxTitle } from "../BoxTitle";
import { Button } from "../Button";
import { FormError } from "../FormError";
import { Input } from "../Input";
import { Select } from "../Select";
import { Specialty } from "../Specialty";
import { ToastMessage } from "../ToastMessage";

interface Props {
    doctorId: number;
    setDoctor: React.Dispatch<React.SetStateAction<IDoctorDto | null>>;
    isAdminEdit?: boolean;
}

export default function EditDoctor({
    doctorId,
    setDoctor,
    isAdminEdit = false,
}: Props) {
    const account = useAccount();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [doctorFullInfo, setDoctorFullInfo] = useState<IDoctorDto>();
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [loading, setLoading] = useState<boolean>(false);
    const [councilType, setCouncilType] = useState<string>("");

    const emptySpeciality = {
        specialty: "",
        registrationNumber: "",
    };

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
        cpf: Yup.string().required("O CPF é obrigatório"),
        councilType: Yup.string(),
        councilUf: Yup.string().required("A UF do conselho é obrigatória"),
        crm: Yup.number().required("O número do conselho é obrigatório"),
        doctorSpecialty: Yup.array().of(
            Yup.object().shape({
                registrationNumber: Yup.string(),
                specialty: Yup.string(),
            }),
        ),
    });

    const formik = useFormik({
        initialValues: {
            crm: doctorFullInfo?.crm,
            cpf: doctorFullInfo?.cpf,
            name: doctorFullInfo?.name,
            birthDate: formatDateyyyyMMdd(String(doctorFullInfo?.birthDate)),
            email: doctorFullInfo?.email,
            phoneNumber: doctorFullInfo?.phoneNumber,
            personType: doctorFullInfo?.personType,
            socialName: doctorFullInfo?.socialName,
            doctorId: doctorFullInfo?.doctorId,
            doctorSpecialty: doctorFullInfo?.doctorSpecialty,
            personId: doctorFullInfo?.personId,
            councilUf: doctorFullInfo?.councilUf,
            councilType: String(
                RegionalCouncilIdToName[Number(doctorFullInfo?.councilType)],
            ),
            sex: doctorFullInfo?.sex,
            address: {
                cep: doctorFullInfo?.address.cep,
                city: doctorFullInfo?.address?.city,
                district: doctorFullInfo?.address?.district,
                street: doctorFullInfo?.address?.street,
                number: doctorFullInfo?.address?.number,
                complement: doctorFullInfo?.address?.complement,
                state: doctorFullInfo?.address?.state,
                ownerName: doctorFullInfo?.address?.ownerName,
                ownerEmail: doctorFullInfo?.address?.ownerEmail,
                ownerPhone: doctorFullInfo?.address?.ownerPhone,
                addressId: doctorFullInfo?.address.addressId,
                ownerAddressId: doctorFullInfo?.address.addressId,
            },
        },
        validationSchema,
        onSubmit: async (payload: any) => {
            try {
                if (
                    councilType ===
                    "CRMV - Conselho Regional de Medicina Veterinária"
                ) {
                    const invalidSpecialitiesWithMapa =
                        payload.doctorSpecialty.filter(
                            (specialitie: any, index: number) =>
                                !specialitie.registrationNumber.length &&
                                index === 0,
                        );

                    if (invalidSpecialitiesWithMapa.length) {
                        toast.info(
                            <ToastMessage
                                title="Atenção"
                                description="MAPA deve ser preenchido!"
                            />,
                        );
                        return;
                    }

                    const invalidSpecialitiesWithoutMapa =
                        payload.doctorSpecialty.filter(
                            (specialitie: any, index: number) =>
                                !specialitie.specialty.length && index !== 0,
                        );
                    if (invalidSpecialitiesWithoutMapa.length) {
                        toast.info(
                            <ToastMessage
                                title="Atenção"
                                description="Especialidade deve ser preenchida!"
                            />,
                        );
                        return;
                    }
                } else if (
                    councilType === "CRM - Conselho Regional de Medicina"
                ) {
                    const invalidSpecialities = payload.doctorSpecialty.filter(
                        (specialitie: any) =>
                            ((!specialitie.specialty.length ||
                                specialitie.specialty ===
                                    "Nome da especialidade") &&
                                specialitie.registrationNumber.length) ||
                            (specialitie.specialty.length &&
                                !specialitie.registrationNumber.length) ||
                            ((!specialitie.specialty.length ||
                                specialitie.specialty ===
                                    "Nome da especialidade") &&
                                !specialitie.registrationNumber.length),
                    );

                    if (invalidSpecialities.length) {
                        toast.info(
                            <ToastMessage
                                title="Atenção"
                                description="Especialidade e RQE devem ser preenchidos!"
                            />,
                        );
                        return;
                    }
                } else {
                    const invalidSpecialities = payload.doctorSpecialty.filter(
                        (specialitie: any) =>
                            !specialitie.specialty.length ||
                            specialitie.specialty === "Nome da especialidade",
                    );

                    if (invalidSpecialities.length) {
                        toast.info(
                            <ToastMessage
                                title="Atenção"
                                description="Especialidade é obrgatória ou deve ser removida!"
                            />,
                        );
                        return;
                    }
                }

                payload.doctorSpecialty.forEach((specialitie: any) => {
                    if (specialitie.specialty === "Nome da especialidade") {
                        specialitie.specialty = null;
                    }
                });
                setLoading(true);
                if (
                    RegionalCouncilNameToId[payload.councilType] === undefined
                ) {
                    setLoading(false);
                    toast.info(
                        <ToastMessage
                            title="Atenção"
                            description="O conselho regional é obrigatório!"
                        />,
                    );
                    return;
                }
                const result: IUpdateDoctorDto = {
                    ...payload,
                    personId: doctorFullInfo?.personId,
                    councilType: RegionalCouncilNameToId[payload.councilType],
                    address: {
                        ...payload.address,
                        addressId: doctorFullInfo?.address.addressId,
                        ownerAddressId: doctorFullInfo?.address.ownerAddressId,
                    },
                };
                await updateDoctor(result);
                if (isAdminEdit) {
                    await asyncLocalStorage.setItem(
                        localStorageKeys.DOCTOR_NAME,
                        payload.name,
                    );

                    await asyncLocalStorage.setItem(
                        localStorageKeys.COUNCIL_ID,
                        String(RegionalCouncilNameToId[payload.councilType]),
                    );

                    await asyncLocalStorage.setItem(
                        localStorageKeys.CRM,
                        `${
                            RegionalCouncilIdToAcronym[
                                RegionalCouncilNameToId[payload.councilType]
                            ]
                        } ${payload.crm ? payload.crm : ""}`,
                    );

                    account.setDoctorName(payload.name);
                    account.setDoctorCouncilID(
                        String(RegionalCouncilNameToId[payload.councilType]),
                    );
                    account.setDoctorCRM(
                        `${
                            RegionalCouncilIdToAcronym[
                                RegionalCouncilNameToId[payload.councilType]
                            ]
                        } ${payload.crm ? payload.crm : ""}`,
                    );
                    const doctor = await getDoctorById(result.doctorId);
                    setDoctor(doctor);
                }

                toast.success(
                    <ToastMessage
                        title="Dados alterados!"
                        description="Seus dados foram salvos e serão utilizados em novas emições de documentos "
                    />,
                );
                setLoading(false);
                onClose();
            } catch (error) {
                toast.error(
                    <ToastMessage
                        title="Erro!"
                        description="Erro ao alterar os dados da sua conta."
                    />,
                );
            }
        },
    });

    function removeModalSpeciality(index: number) {
        if (Array.isArray(formik.values.doctorSpecialty)) {
            const isANewSpeciality = !Object.prototype.hasOwnProperty.call(
                formik.values.doctorSpecialty[index],
                "id",
            );
            if (isANewSpeciality) {
                formik.initialValues.doctorSpecialty?.splice(index, 1);
                formik.values.doctorSpecialty?.splice(index, 1);
            } else {
                formik.values.doctorSpecialty?.splice(index, 1);
            }
            void formik.validateForm();
            forceUpdate();
        }
    }

    function addSpecialistComponent() {
        formik.values?.doctorSpecialty?.push(emptySpeciality as any);
        if (formik.values?.doctorSpecialty?.length === 1) {
            void formik.validateForm();
        }
        forceUpdate();
    }

    async function openFunction() {
        const result = await getDoctorById(doctorId);
        setDoctorFullInfo(result);
        setCouncilType(
            String(RegionalCouncilIdToName[Number(result?.councilType)]),
        );
        await formik.setValues({
            crm: result?.crm,
            cpf: result?.cpf,
            name: result?.name,
            birthDate: formatDateyyyyMMdd(String(result?.birthDate)),
            email: result?.email,
            phoneNumber: result?.phoneNumber,
            personType: result?.personType,
            socialName: result?.socialName,
            doctorId: result?.doctorId,
            doctorSpecialty: result?.doctorSpecialty,
            personId: result?.personId,
            councilUf: result?.councilUf,
            councilType: String(
                RegionalCouncilIdToName[Number(result?.councilType)],
            ),
            sex: result?.sex,
            address: {
                cep: result?.address.cep,
                city: result?.address?.city,
                district: result?.address?.district,
                street: result?.address?.street,
                number: result?.address?.number,
                complement: result?.address?.complement,
                state: result?.address?.state,
                ownerName: result?.address?.ownerName,
                ownerEmail: result?.address?.ownerEmail,
                ownerPhone: result?.address?.ownerPhone,
                addressId: result?.address.addressId,
                ownerAddressId: result?.address.addressId,
            },
        });
        onOpen();
        forceUpdate();
    }

    useEffect(() => {
        void formik.validateForm();
    }, [doctorFullInfo]);

    return (
        <>
            {!isAdminEdit ? (
                <Flex
                    direction="row"
                    width="100%"
                    // eslint-disable-next-line no-void, @typescript-eslint/no-misused-promises
                    onClick={openFunction}
                    textAlign="center"
                    _hover={{
                        cursor: "pointer",
                    }}
                >
                    <ListItem
                        cursor="pointer"
                        _hover={{
                            backgroundColor: "#EDEDF3",
                            h: "100%",
                        }}
                        _active={{
                            background: "gray.500",
                        }}
                        _focus={{
                            background: "gray.500",
                        }}
                        h="100%"
                        w="100%"
                        display="flex"
                        flexDirection="row"
                    >
                        <i
                            className="ri-pencil-line"
                            style={{
                                color: "#94A0B4",
                                fontSize: "21px",
                                alignSelf: "flex-end",
                                marginRight: "5px",
                                marginLeft: "8px",
                                marginTop: "2px",
                            }}
                        ></i>
                        <Text mt="2px">Visualizar / Editar</Text>
                    </ListItem>
                </Flex>
            ) : (
                <Box
                    width="33%"
                    // eslint-disable-next-line no-void, @typescript-eslint/no-misused-promises
                    onClick={openFunction}
                    textAlign="center"
                    _hover={{
                        cursor: "pointer",
                    }}
                >
                    <i
                        className="ri-pencil-line"
                        style={{
                            color: "#94A0B4",
                            fontSize: "25px",
                            alignSelf: "flex-end",
                        }}
                    ></i>
                    <Text color="gray.200" fontWeight={500}>
                        Editar
                    </Text>
                </Box>
            )}
            <Modal
                scrollBehavior="outside"
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white" padding={0}>
                    <ModalHeader>Editar dados de conta</ModalHeader>
                    <ModalCloseButton />
                    <form onSubmit={formik.handleSubmit}>
                        <ModalBody padding={0}>
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100%"
                            >
                                <BoxTitle text="Informações Pessoais" />
                                <Flex
                                    flexDirection="column"
                                    minHeight="100px"
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
                                                onChange={formik.handleChange}
                                                id="cpf"
                                                name="cpf"
                                                type="text"
                                                errorMessage="CPF Inválido"
                                                mask="999.999.999-99"
                                                disabled={isCPF(
                                                    String(formik.values.cpf),
                                                )}
                                                validation={
                                                    !isCPF(
                                                        String(
                                                            formik.values.cpf,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Box>
                                        <Flex
                                            width="100%"
                                            direction="column"
                                            display="block"
                                        >
                                            <Select
                                                placeholder="Conselho Regional"
                                                options={RegionalCouncilList}
                                                value={
                                                    formik.values.councilType
                                                }
                                                id="councilType"
                                                name="councilType"
                                                onChange={async (e: any) => {
                                                    formik.handleChange(e);
                                                    setCouncilType(
                                                        e.target.value,
                                                    );
                                                    await formik.validateForm();
                                                    formik.values.doctorSpecialty?.forEach(
                                                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                                        async (
                                                            _: any,
                                                            index: number,
                                                        ) => {
                                                            await formik.validateField(
                                                                `doctorSpecialty[${index}].registrationNumber`,
                                                            );
                                                            await formik.setFieldValue(
                                                                `doctorSpecialty[${index}].specialty`,
                                                                "Nome da especialidade",
                                                            );
                                                            if (
                                                                councilType ===
                                                                "CRMV - Conselho Regional de Medicina Veterinária"
                                                            ) {
                                                                await formik.setFieldValue(
                                                                    `doctorSpecialty[${index}].registrationNumber`,
                                                                    "",
                                                                );
                                                            }
                                                        },
                                                    );
                                                    forceUpdate();
                                                }}
                                                width="100%"
                                            />
                                            {formik.values.councilType ===
                                            "" ? (
                                                <FormError
                                                    message={String(
                                                        formik.errors
                                                            ?.councilType,
                                                    )}
                                                />
                                            ) : null}
                                        </Flex>
                                    </Flex>
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
                                            <Flex
                                                width="100%"
                                                direction="column"
                                                display="block"
                                            >
                                                <Select
                                                    placeholder="UF do Conselho"
                                                    options={ufs}
                                                    value={
                                                        formik.values.councilUf
                                                    }
                                                    id="councilUf"
                                                    name="councilUf"
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    width="100%"
                                                />
                                                {formik.values.councilUf ===
                                                "" ? (
                                                    <FormError
                                                        message={String(
                                                            formik.errors
                                                                ?.councilUf,
                                                        )}
                                                    />
                                                ) : null}
                                            </Flex>
                                        </Box>
                                        <Flex
                                            width="100%"
                                            direction="column"
                                            display="block"
                                        >
                                            <Input
                                                width="100%"
                                                placeholder="Número do Conselho"
                                                value={formik.values.crm}
                                                onChange={(e: any) => {
                                                    if (
                                                        String(
                                                            formik.values.crm,
                                                        ).length < 10 ||
                                                        e.target.value.length <
                                                            10
                                                    ) {
                                                        formik.handleChange(e);
                                                    }
                                                }}
                                                id="crm"
                                                name="crm"
                                                type="number"
                                                maxLength={10}
                                            />
                                            {formik.values.crm === "" ? (
                                                <FormError
                                                    message={String(
                                                        formik.errors?.crm,
                                                    )}
                                                />
                                            ) : null}
                                        </Flex>
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
                                            disabled
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
                                            <Flex
                                                width="100%"
                                                direction="column"
                                                display="block"
                                            >
                                                <Select
                                                    width="100%"
                                                    placeholder="Sexo biológico"
                                                    options={[
                                                        "Masculino",
                                                        "Feminino",
                                                    ]}
                                                    id="sex"
                                                    name="sex"
                                                    value={formik.values.sex}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                />
                                                <FormError
                                                    message={String(
                                                        formik.errors?.sex,
                                                    )}
                                                />
                                            </Flex>
                                        </Box>
                                    </Box>
                                </Flex>
                            </Box>
                            <Box
                                zIndex={1}
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
                                    <Input
                                        placeholder="E-mail"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        id="email"
                                        name="email"
                                        disabled={isAdminEdit}
                                    />
                                    <Input
                                        placeholder="Telefone"
                                        value={formik.values.phoneNumber}
                                        onChange={formik.handleChange}
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        mask={"(99) 999999999"}
                                    />
                                </Flex>
                            </Box>

                            <Box paddingBottom="30%" zIndex={1} pb="100px">
                                {formik?.values?.doctorSpecialty?.map(
                                    (
                                        _speciality: IDoctorSpecialityDto,
                                        index: number,
                                    ) => (
                                        <Box key={index} marginBottom="10px">
                                            <Specialty
                                                rqeError={""}
                                                specialityError={getIn(
                                                    formik.errors,
                                                    `doctorSpecialty[${index}].specialty`,
                                                )}
                                                index={index}
                                                specialityNameValue={
                                                    Array.isArray(
                                                        formik.values
                                                            ?.doctorSpecialty,
                                                    )
                                                        ? formik.values
                                                              ?.doctorSpecialty[
                                                              index
                                                          ].specialty
                                                        : ""
                                                }
                                                specialityNameHandleChange={
                                                    formik.handleChange
                                                }
                                                specialityId={`doctorSpecialty[${index}].specialty`}
                                                reqHandleChange={
                                                    formik.handleChange
                                                }
                                                rqeValue={
                                                    Array.isArray(
                                                        formik.values
                                                            ?.doctorSpecialty,
                                                    )
                                                        ? formik.values
                                                              ?.doctorSpecialty[
                                                              index
                                                          ].registrationNumber
                                                        : ""
                                                }
                                                rqeId={`doctorSpecialty[${index}].registrationNumber`}
                                                removeSpecialityModalFunction={() =>
                                                    removeModalSpeciality(index)
                                                }
                                                council={councilType}
                                            />
                                        </Box>
                                    ),
                                )}
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
                        </ModalBody>

                        <ModalFooter
                            justifyContent="center"
                            position={{ base: "fixed", md: "absolute" }}
                            bottom="0"
                            boxShadow="inset 0px 1px 0px #EDEDF3"
                            paddingTop="16px"
                            backgroundColor="white.10"
                            width="100%"
                            zIndex={5}
                        >
                            <Flex
                                width={{ base: "100%" }}
                                justifyContent={{
                                    base: "center",
                                    md: "flex-end",
                                }}
                                marginBottom="15px"
                            >
                                <Button
                                    disable={!formik.isValid}
                                    isLoading={loading}
                                    fontSize={14}
                                    width="100%"
                                    text="Continuar"
                                    bgColor="#D72A34"
                                    hasIcon={false}
                                    textColor="#FFFFFF"
                                    type="submit"
                                />
                            </Flex>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
}
