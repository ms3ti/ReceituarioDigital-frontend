import {
    Modal,
    Text,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Flex,
    ModalFooter,
    useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { validateEmail } from "../../utils/validateEmail";
import { Input } from "../Input";
import { Button } from "../Button";
import { recoveryPassword } from "../../services/recoveryPassword";
import { toast } from "react-toastify";
import { ToastMessage } from "../ToastMessage";
import { forgotPasswordErrorMessage } from "../../utils/errorsParser/forgotPasswordErrorMessage";

export function ResetPassword() {
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [email, setEmail] = useState("");
    async function handleSubmit() {
        try {
            if (!validateEmail(email)) {
                toast.warning(
                    <ToastMessage
                        title="Atenção"
                        description="E-mail inválido, por favor digite um email válido!"
                    />,
                );
                return
            }
            await recoveryPassword(email);
            toast.success(
                <ToastMessage
                    title="Sucesso"
                    description="Foi enviada uma nova senha para o seu e-mail"
                />,
            );
            onClose();
        } catch (error: any) {
            const errorMessage =
                forgotPasswordErrorMessage[error.error.message as string] ||
                "Houve um erro ao recuperar a sua senha";
            toast.error(
                <ToastMessage title="Erro" description={errorMessage} />,
            );
            onClose();
        }
    }
    return (
        <>
            <Flex direction="row" alignItems="center">
                <Text
                    marginLeft="10px"
                    color="red.100"
                    fontSize={14}
                    _hover={{
                        cursor: "pointer",
                    }}
                    onClick={onOpen}
                >
                    Esqueci minha senha
                </Text>
            </Flex>

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Esqueci minha senha
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex flexDirection="column">
                            <Input
                                errorMessage="E-mail inválido"
                                placeholder="Digite o seu e-mail"
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                                validation={!validateEmail(String(email))}
                            />
                        </Flex>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            bgColor="#D72A34"
                            textColor="#FFFFFF"
                            fontSize={14}
                            hasIcon={false}
                            text="Continuar"
                            type="submit"
                            onClick={handleSubmit}                        
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
