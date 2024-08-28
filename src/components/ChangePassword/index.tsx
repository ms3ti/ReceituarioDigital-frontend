import {
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Box,
    Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { Button } from "../Button";
import * as Yup from "yup";
import YupPassword from "yup-password";
import { FormError } from "../FormError";
import { InputIcon } from "../InputIcon";
import { IChangePasswordDto } from "../../interfaces/user/change.password.dto";
import { IChangePasswordPayloadDto } from "../../interfaces/user/change.password.payload.dto";
import { changePassword } from "../../services/changePassword";
import { toast } from "react-toastify";
import { ToastMessage } from "../ToastMessage"; // extend yup
import { useNavigate } from "react-router-dom";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
YupPassword(Yup);

interface Props {
    email: string;
    isAdminList: boolean;
}

export function ChangePassword({ email, isAdminList = false }: Props) {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const passwordValidation = Yup.object().shape({
        newPassword: Yup.string()
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
            ),
        confirmNewPassword: Yup.string().oneOf(
            [Yup.ref("newPassword"), null],
            "As senhas devem ser iguais",
        ),
    });

    const formik = useFormik({
        initialValues: {
            password: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        validationSchema: passwordValidation,
        onSubmit: async (data: IChangePasswordDto) => {
            try {
                const payload: IChangePasswordPayloadDto = {
                    email,
                    newPassword: data.newPassword,
                    oldPassword: data.password,
                };

                await changePassword(payload);
                await asyncLocalStorage.removeItem(localStorageKeys.TOKEN);
                await asyncLocalStorage.removeItem(localStorageKeys.EMAIL);
                await asyncLocalStorage.removeItem(localStorageKeys.PERSON_ID);
                await asyncLocalStorage.removeItem(localStorageKeys.DOCTOR_ID);
                await asyncLocalStorage.removeItem(
                    localStorageKeys.DOCTOR_NAME,
                );
                await asyncLocalStorage.removeItem(localStorageKeys.ADDRESS);
                onClose();
                toast.success(
                    <ToastMessage
                        title="Senha alterada"
                        description="Senha alterada com sucesso!"
                    />,
                );
                navigate("/");
            } catch (error) {
                console.log(error);
                toast.error(
                    <ToastMessage
                        title="Erro ao alterar a senha"
                        description="Houve um erro ao alterar a sua senha, por favor tente novamente."
                    />,
                );
            }
            formik.resetForm();
        },
    });

    return (
        <>
            {isAdminList ? (
                <Button
                    width="110px"
                    type="submit"
                    height="30px"
                    // eslint-disable-next-line no-void
                    onClick={onOpen}
                    text="Alterar senha"
                    textColor="red"
                    bgColor="#FFFF"
                    icon={<i className="ri-key-2-line"></i>}
                    variant={"outline"}
                    hasIcon
                    maxWidth="238px"
                    borderRadius="5px"
                    fontSize={12}
                />
            ) : (
                <Box
                    width="33%"
                    textAlign="center"
                    _hover={{
                        cursor: "pointer",
                    }}
                    onClick={onOpen}
                >
                    <i
                        className="ri-key-2-line"
                        style={{
                            color: "#94A0B4",
                            fontSize: "25px",
                            alignSelf: "flex-end",
                        }}
                    ></i>
                    <Text color="gray.200" fontWeight={500}>
                        Alterar senha
                    </Text>
                </Box>
            )}
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    formik.resetForm();
                    onClose();
                }}
                motionPreset="slideInBottom"
                isCentered
                size={{ base: "full", md: "md" }}
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <form onSubmit={formik.handleSubmit}>
                        <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                            Alterar senha
                        </ModalHeader>
                        <Box>
                            <Text
                                textAlign="left"
                                color="#202D46"
                                fontWeight={500}
                                paddingLeft="10px"
                                paddingRight="10px"
                                marginLeft="20px"
                                marginTop="20px"
                            >
                                Para alterar sua senha precisamos que informe a
                                atual senha da sua conta{" "}
                            </Text>
                        </Box>
                        <ModalCloseButton />
                        <ModalBody>
                            <InputIcon
                                placeholder="Senha atual"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                id="password"
                                name="password"
                            />
                            <FormError
                                message={String(formik.errors?.password)}
                            />

                            <InputIcon
                                placeholder="Nova senha"
                                value={formik.values.newPassword}
                                onChange={formik.handleChange}
                                id="newPassword"
                                name="newPassword"
                            />
                            <FormError
                                message={String(formik.errors?.newPassword)}
                            />

                            <InputIcon
                                placeholder="Repita a nova senha"
                                value={formik.values.confirmNewPassword}
                                onChange={formik.handleChange}
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                            />
                            <FormError
                                message={String(
                                    formik.errors?.confirmNewPassword,
                                )}
                            />
                        </ModalBody>

                        <ModalFooter
                            boxShadow="inset 0px 1px 0px #EDEDF3"
                            marginTop="20px"
                            paddingTop="20px"
                        >
                            <Button
                                bgColor="#D72A34"
                                textColor="#FFFFFF"
                                fontSize={14}
                                hasIcon={false}
                                text="Continuar"
                                type="submit"
                            />
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
}
