import {
    useDisclosure,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Flex,
    Box,
    ListItem,
} from "@chakra-ui/react";
import { isCPF } from "brazilian-values";
import { useFormik } from "formik";
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useEffect,
    useReducer,
    useState,
} from "react";
import { IPersonDto } from "../../interfaces/person/person.dto";
import { createAdmin } from "../../services/createAdmin";
import { getAdminByPersonId } from "../../services/getAdminByPersonId";
import { updateAdmin } from "../../services/updateAdmin";
import { formatDateyyyyMMdd } from "../../utils/formatDateyyyyMMdd";
import { BoxTitle } from "../BoxTitle";
import { Button } from "../Button";
import { FormError } from "../FormError";
import { Input } from "../Input";
import { Select } from "../Select";
import * as Yup from "yup";
import YupPassword from "yup-password";
import { InputIcon } from "../InputIcon";
import { removeMask } from "../../utils/removeMask";
import { toast } from "react-toastify";
import { ToastMessage } from "../ToastMessage";
import { receitaCpfApi } from "../../services/receitaCpfApi";
import { checkAdminByCPF } from "../../services/checkAdminByCPF";
YupPassword(Yup);

interface Props {
    personId?: number;
    isCreation: boolean;
    setSearchWord?: Dispatch<SetStateAction<string>>;
}

export function Admin({ personId, isCreation, setSearchWord }: Props) {
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);

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
        name: Yup.string().required("O nome é obrigatório."),
        email: Yup.string().required("O email é obrigatório."),
        birthDate: Yup.string().required("A data de nascimento é obrigatório"),
        sex: Yup.string().required("O sexo é obrigatório."),
        phoneNumber: Yup.string()
            .nullable()
            .transform((value, originalValue) =>
                originalValue.trim() === "" ? null : value,
            )
            .test(
                "len",
                "O número precisa ter no mínimo 10 caracteres",
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
        cpf: Yup.string().required("O CPF é obrigatório"),
        ...(isCreation ? passValidation : {}),
    });

    const formik = useFormik({
        initialValues: {
            cpf: "",
            name: "",
            sex: "",
            birthDate: "",
            socialName: "",
            email: "",
            phoneNumber: "",
            mothersName: "",
            personType: 3,
            password: "",
            confirmationPassword: "",
            approve: true,
            address: {
                state: "",
                cep: "",
                city: "",
                district: "",
                street: "",
                number: "",
            },
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                values.phoneNumber = removeMask.ownerPhone(values.phoneNumber);
                values.cpf = removeMask.cpf(values.cpf);
                if (isCreation) {
                    values.approve = true;
                    await createAdmin(values);
                } else {
                    const payload = {
                        cpf: String(values.cpf),
                        name: String(values.name),
                        sex: String(values.sex),
                        birthDate: formatDateyyyyMMdd(
                            String(values?.birthDate),
                        ),
                        socialName: String(values.socialName),
                        email: String(values.email),
                        phoneNumber: String(values.phoneNumber),
                        mothersName: String(values.mothersName),
                    };
                    if (personId) {
                        await updateAdmin(personId, payload as IPersonDto);
                    }
                }
                formik.resetForm();
                if (typeof setSearchWord === "function") {
                    setSearchWord("searchWord");
                }
                toast.success(
                    <ToastMessage
                        title={
                            isCreation
                                ? "Administrador criado com sucesso!"
                                : "Administrador alterado com sucesso!"
                        }
                    />,
                );
                setLoading(false);
                onClose();
            } catch (error: any) {
                setLoading(false);
                toast.error(
                    <ToastMessage
                        title={
                            isCreation
                                ? `${error.error.message}`
                                : "Erro ao editar administrador"
                        }
                        description="Por favor tente novamente"
                    />,
                );
            }
        },
    });

    async function getInfo() {
        if (personId) {
            const result = await getAdminByPersonId(personId);
            await formik.setValues({
                cpf: String(result.cpf),
                name: String(result.name),
                sex: String(result.sex),
                birthDate: formatDateyyyyMMdd(String(result?.birthDate)),
                socialName: String(result.socialName),
                email: String(result.email),
                phoneNumber: String(result.phoneNumber),
                mothersName: String(result.mothersName),
                personType: 3,
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
    }

    async function getInfoByCPF(cpf: string) {
        try {
            const result = await checkAdminByCPF(removeMask.cpf(cpf));
            if (result) {
                await formik.setValues({
                    cpf: String(result.cpf),
                    name: String(result.name),
                    sex: String(result.sex),
                    birthDate: formatDateyyyyMMdd(String(result?.birthDate)),
                    socialName: String(result.socialName),
                    email: String(result.email),
                    phoneNumber: String(result.phoneNumber),
                    mothersName: String(result.mothersName),
                    personType: 3,
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

                if (receitaApi.nome) {
                    await formik.setFieldValue("name", receitaApi.nome);
                }
            }

            forceUpdate();
        } catch (error: any) {
            setLoading(false);
            console.log(error);
            toast.error(
                <ToastMessage title="Erro!" description={error.title} />,
            );
        }
    }

    useEffect(() => {
        if (!isCreation) {
            void getInfo();
        }
    }, [isOpen]);
    return (
        <>
            {isCreation ? (
                <Button
                    borderColor="#EDEDF3"
                    width="45%"
                    type="submit"
                    height="47px"
                    onClick={onOpen}
                    text="Novo Administrador"
                    textColor="#202D46"
                    bgColor="white"
                    icon={
                        <i
                            className="ri-admin-line"
                            style={{
                                color: "#D72A34",
                            }}
                        ></i>
                    }
                    variant={"outline"}
                    hasIcon
                    maxWidth="238px"
                    borderRadius={"0.375rem"}
                    fontSize={12}
                />
            ) : (
                <ListItem
                    onClick={onOpen}
                    cursor="pointer"
                    margin={0}
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
                    display="flex"
                    flexDirection="row"
                    marginTop="5px"
                >
                    <i
                        className="ri-pencil-line"
                        style={{
                            color: "#94A0B4",
                            alignSelf: "flex-end",
                            fontSize: "16px",
                            marginLeft: "10px",
                            marginRight: "8px",
                        }}
                    ></i>
                    <Text>Visualizar/Editar</Text>
                </ListItem>
            )}

            <Modal
                scrollBehavior="outside"
                isOpen={isOpen}
                onClose={() => {
                    formik.resetForm();
                    onClose();
                }}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
            >
                <ModalOverlay />
                <ModalContent background="white">
                    <form onSubmit={formik.handleSubmit}>
                        <ModalHeader>
                            {isCreation
                                ? "Novo administrador"
                                : "Editar dados do administrador"}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody padding={0}>
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100%"
                            >
                                <BoxTitle text="Informações Pessoais" />
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
                                        placeholder="CPF"
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>,
                                        ) => {
                                            formik.handleChange(e);
                                            if (isCPF(e.target.value)) {
                                                void getInfoByCPF(
                                                    e.target.value,
                                                );
                                            }
                                        }}
                                        value={formik.values.cpf}
                                        id="cpf"
                                        disabled={isCPF(
                                            String(formik.values.cpf),
                                        )}
                                        name="cpf"
                                        type="text"
                                        errorMessage="CPF Inválido"
                                        mask="999.999.999-99"
                                        validation={
                                            !isCPF(String(formik.values.cpf))
                                        }
                                    />
                                    <FormError
                                        message={String(formik.errors?.name)}
                                    />
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
                                        disabled={isCPF(
                                            String(formik.values.cpf),
                                        )}
                                    />
                                    <FormError
                                        message={String(formik.errors?.name)}
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
                                <Box display={{ base: "block", md: "flex" }}>
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
                                            value={formik.values.birthDate}
                                            type="date"
                                            onChange={formik.handleChange}
                                            id="birthDate"
                                            name="birthDate"
                                            maxLength={7}
                                        />

                                        <FormError
                                            message={String(
                                                formik.errors?.birthDate,
                                            )}
                                        />
                                    </Flex>

                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Select
                                            width="100%"
                                            placeholder="Sexo biológico"
                                            options={["Masculino", "Feminino"]}
                                            id="sex"
                                            name="sex"
                                            value={formik.values.sex}
                                            onChange={formik.handleChange}
                                        />
                                        <FormError
                                            message={String(formik.errors?.sex)}
                                        />
                                    </Flex>
                                </Box>
                            </Box>
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                marginTop="20px"
                                width="100%"
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
                                        <FormError
                                            message={String(
                                                formik.errors?.email,
                                            )}
                                        />
                                    </Flex>
                                    <Flex
                                        width="100%"
                                        direction="column"
                                        display="block"
                                    >
                                        <Input
                                            placeholder="Telefone"
                                            value={formik.values.phoneNumber}
                                            onChange={formik.handleChange}
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            mask={"(99) 999999999"}
                                        />
                                        <FormError
                                            message={String(
                                                formik.errors?.phoneNumber,
                                            )}
                                        />
                                    </Flex>
                                </Flex>
                            </Box>
                            {isCreation ? (
                                <Box
                                    backgroundColor={"#F7F8FA"}
                                    padding="15px"
                                    width="100%"
                                    marginBottom="20px"
                                >
                                    <BoxTitle text="Crie uma senha" />
                                    <Flex
                                        width="100%"
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
                                            <InputIcon
                                                width="100%"
                                                placeholder="Senha"
                                                value={formik.values.password}
                                                onChange={formik.handleChange}
                                                id="password"
                                                name="password"
                                            />
                                            <FormError
                                                message={String(
                                                    formik.errors?.password,
                                                )}
                                            />
                                        </Flex>

                                        <Flex
                                            width="100%"
                                            direction="column"
                                            display="block"
                                        >
                                            <InputIcon
                                                width="100%"
                                                placeholder="Confirmação de senha"
                                                value={
                                                    formik.values
                                                        .confirmationPassword
                                                }
                                                onChange={formik.handleChange}
                                                id="confirmationPassword"
                                                name="confirmationPassword"
                                            />
                                            <FormError
                                                message={String(
                                                    formik.errors
                                                        ?.confirmationPassword,
                                                )}
                                            />
                                        </Flex>
                                    </Flex>
                                </Box>
                            ) : null}
                        </ModalBody>

                        <ModalFooter boxShadow="inset 0px 1px 0px #EDEDF3">
                            <Button
                                disable={loading || formik.isValid}
                                fontSize={14}
                                width="100%"
                                text="Continuar"
                                bgColor="#D72A34"
                                hasIcon={false}
                                textColor="#FFFFFF"
                                type="submit"
                                isLoading={loading}
                            />
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
}
