import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Flex,
    ModalFooter,
    Text,
} from "@chakra-ui/react";
import { isCPF } from "brazilian-values";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../Button";
import { Input } from "../Input";

interface Props {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    text: string;
    setCPF: Dispatch<SetStateAction<string>>;
    cpf: string;
    loading?: boolean;
}

export function AddCPF({
    isOpen,
    onClose,
    onOpen,
    text,
    setCPF,
    cpf,
    loading,
}: Props) {
    return (
        <>
            <Text onClick={onOpen}>{text}</Text>

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Esta receita exige CPF
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex flexDirection="column">
                            <Input
                                mask="999.999.999-99"
                                errorMessage="CPF Inválido"
                                placeholder="CPF do paciente"
                                value={cpf}
                                onChange={(e: any) => setCPF(e.target.value)}
                                validation={!isCPF(String(cpf))}
                            />
                        </Flex>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            disable={!isCPF(String(cpf))}
                            bgColor="#D72A34"
                            textColor="#FFFFFF"
                            fontSize={14}
                            hasIcon={false}
                            text="Continuar"
                            type="submit"
                            onClick={onClose}
                            isLoading={loading}
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
