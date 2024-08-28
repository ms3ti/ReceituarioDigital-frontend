import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { validateEmail } from "../../utils/validateEmail";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";

import { login } from "../../services/login";

import {
    Box,
    Text,
    Image,
    Flex,
    Heading,
    HStack,
    Center,
} from "@chakra-ui/react";
import { Button, CreateUserModal, Input, InputIcon } from "../../components";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { ToastMessage } from "../../components/ToastMessage";
import { useAccount } from "../../contexts/accountContext";
import { loginErrorParser } from "../../utils/errorsParser/loginErrorParser";
import { RegionalCouncilIdToAcronym } from "../../utils/enum/council.enum";
import { getAdminByEmail } from "../../services/getAdminByEmail";
import { ResetPassword } from "../../components/ResetPassword";

interface Props {
    email: string;
    password: string;
}

export default function Login() {
    const account = useAccount();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [shouldShowMessage, setShouldShowMessage] = useState(true);

    async function showExpiredMessage() {
        if (searchParams.get("expired") === "true" && shouldShowMessage) {
            toast.info(
                <ToastMessage
                    title="Sessão expirada"
                    description="A sua sessão expirou, por favor entre novamente!"
                />,
            );
            setShouldShowMessage(false);
            await asyncLocalStorage.clearAll();
        }
    }

    useEffect(() => {
        void showExpiredMessage();
    }, []);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        onSubmit: async (values: Props) => {
            try {
                setLoading(true);
                const response = await login(values);
                await asyncLocalStorage.setItem(
                    localStorageKeys.TOKEN,
                    response.idToken.jwtToken,
                );
                const result = await getAdminByEmail(values.email);
                await asyncLocalStorage.setItem(
                    localStorageKeys.DOCTOR_NAME,
                    String(result?.name),
                );
                await asyncLocalStorage.setItem(
                    localStorageKeys.DOCTOR_ID,
                    JSON.stringify(result?.doctorId ? result?.doctorId : ""),
                );
                await asyncLocalStorage.setItem(
                    localStorageKeys.PERSON_ID,
                    JSON.stringify(String(result?.personId)),
                );

                await asyncLocalStorage.setItem(
                    localStorageKeys.ADDRESS,
                    JSON.stringify(String(result?.address)),
                );
                await asyncLocalStorage.setItem(
                    localStorageKeys.EMAIL,
                    JSON.stringify(String(result?.email)),
                );

                const crm = `${
                    String(
                        RegionalCouncilIdToAcronym[Number(result?.councilType)],
                    ) !== "undefined"
                        ? RegionalCouncilIdToAcronym[
                              Number(result?.councilType)
                          ]
                        : ""
                } ${String(result?.crm)}`;

                await asyncLocalStorage.setItem(
                    localStorageKeys.CRM,
                    JSON.stringify(crm),
                );
                await asyncLocalStorage.setItem(
                    localStorageKeys.COUNCIL_ID,
                    JSON.stringify(
                        `${result?.councilType ? result?.councilType : ""}`,
                    ),
                );
                await asyncLocalStorage.setItem(
                    localStorageKeys.PERSON_TYPE,
                    JSON.stringify(`${String(result?.personType)}`),
                );
                setLoading(false);

                account.setDoctorName(result?.name);
                account.setDoctorUf(result?.councilUf);
                account.setDoctorCouncilID(String(result?.councilType));
                account.setDoctorCRM(
                    `${
                        RegionalCouncilIdToAcronym[Number(result?.councilType)]
                    } ${String(result?.crm)}`,
                );
                if (result.personType === 3) {
                    navigate(`/admin`);
                } else {
                    navigate(`/showPrescriptions/${String(result?.doctorId)}`);
                }
            } catch (error: any) {
                setLoading(false);
                let errorMessage = "";
                if (typeof error?.error?.message === "string") {
                    errorMessage =
                        error.error.message ||
                        loginErrorParser[error?.error?.name];
                }
                toast.error(
                    <ToastMessage
                        title="Erro"
                        description={
                            errorMessage || "Erro ao logar, tente novamente."
                        }
                    />,
                );
            }
        },
    });

    return (
        <HStack w="full" h="100vh">
            <Flex
                w="full"
                h="full"
                backgroundColor="blue.200"
                alignContent="flex-start"
                justifyContent="flex-start"
                display={{ base: "none", md: "flex" }}
            >
                <Center w="xl" ml={"93px"}>
                    <Text
                        fontSize="62px"
                        fontWeight={900}
                        color="white.10"
                        lineHeight="87px"
                    >
                        Prescrição digital
                        <br />
                        rápida e fácil
                    </Text>
                </Center>
            </Flex>
            <Flex
                w={["full", 419]}
                h="full"
                flexDirection="column"
                justifyContent="center"
                p={6}
            >
                <form onSubmit={formik.handleSubmit}>
                    <Box px={2}>
                        <Image
                            width={"80px"}
                            height={"80px"}
                            src="logo/mrd-logo-icon.svg"
                            alt="Meu receituario digital logo"
                        />
                    </Box>
                    <Box px={2}>
                        <Text fontWeight={900} fontSize="24px">
                            <Heading size="28px" fontWeight={800}>
                                Meu Receituário Digital
                            </Heading>
                        </Text>
                        <Text
                            color="gray.300"
                            fontSize={"16px"}
                            fontWeight={500}
                            py={2}
                        >
                            Para entrar informar o e-mail e senha
                        </Text>
                    </Box>
                    <Box>
                        <Center w={"100%"} flexDirection="column">
                            <Input
                                width="96%"
                                placeholder="E-mail"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                id="email"
                                name="email"
                                errorMessage="E-mail Inválido"
                                validation={!validateEmail(formik.values.email)}
                            />

                            <InputIcon
                                required
                                width="100%"
                                placeholder="Senha"
                                onChange={formik.handleChange}
                                id="password"
                                name="password"
                                value={formik.values.password}
                            />
                        </Center>
                        <Center w={"99%"} flexDirection="column" py={1}>
                            <Button
                                isLoading={loading}
                                disable={loading}
                                fontSize={14}
                                width="98%"
                                height="50px"
                                text="Entrar"
                                bgColor="red.100"
                                hasIcon={false}
                                textColor="white.10"
                                onClick={() => {}}
                            />
                        </Center>
                    </Box>
                </form>
                <Center flexDirection="column" py="20px">
                    <ResetPassword />

                    <Flex flexDirection="row" py="15px">
                        <Text
                            color="gray.100"
                            fontWeight={600}
                            fontSize={"12px"}
                            px={2}
                        >
                            Ainda não possui conta?
                        </Text>
                        <Text color="red.100" fontSize={12} fontWeight={900}>
                            <CreateUserModal
                                isDoctorCreation
                                buttonMessage="Criar nova conta"
                            />
                        </Text>
                    </Flex>
                </Center>
            </Flex>
        </HStack>
    );
}
