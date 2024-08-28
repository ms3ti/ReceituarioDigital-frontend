import {
    Button as ChakraButton,
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
import { toast } from "react-toastify";
import { deleteAddress } from "../../services/deleteAddress";
import { Button } from "../Button";
import { ToastMessage } from "../ToastMessage";
import { useState } from 'react';

interface Props {
    ownerAddressId: number;
    updateList: () => Promise<void>;
    isDefault: boolean;
}

export function DeleteAddressModal({
    ownerAddressId,
    updateList,
    isDefault,
}: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false)

    async function deleteAddressByOwnerAddressId() {
        try {
            setLoading(true);
            await deleteAddress(ownerAddressId);
            await updateList();
            setLoading(false)
            onClose();
            toast.success(
                <ToastMessage
                    title="Deletado"
                    description="Endereço deletado com sucesso!"
                />,
            );
        } catch (error) {
            setLoading(false)
            toast.error(
                <ToastMessage
                    title="Erro"
                    description="Erro ao deletar o endereço."
                />,
            );
        }
    }

    function wrapDeleteAddress() {
        void deleteAddressByOwnerAddressId();
    }

    return (
        <>
            <ChakraButton
                height="max-content"
                margin={0}
                padding={0}
                width="100%"
                disabled={isDefault}
            >
                <MenuItem
                    onClick={isDefault ? () => {} : onOpen}
                    width="100%"
                    _hover={{
                        background: "gray.500",
                        cursor: isDefault ? "not-allowed" : "pointer",
                    }}
                    _active={{
                        background: "gray.500",
                    }}
                    _focus={{
                        background: "gray.500",
                    }}
                >
                    <i
                        className="ri-delete-bin-line"
                        style={{ color: "#7D899D" }}
                    ></i>
                    <Text marginLeft="8px">Excluir</Text>
                </MenuItem>
            </ChakraButton>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Deseja realmente excluir?
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontWeight={500}>
                            Ao deletar um endereço os seus documentos emitidos
                            com o mesmo permanecerão.
                        </Text>
                    </ModalBody>

                    <ModalFooter boxShadow="inset 0px 1px 0px #EDEDF3">
                        <Button
                            isLoading={loading}
                            disable={loading}
                            text="Sim, excluir"
                            bgColor="#D72A34"
                            textColor="#FFFFFF"
                            fontSize={14}
                            hasIcon={false}
                            type="submit"
                            onClick={wrapDeleteAddress}
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
