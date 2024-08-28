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
import { useState } from "react";
import { toast } from "react-toastify";
import { deletePrescriptionModel } from "../../services/deletePrescriptionModel";
import { Button } from "../Button";
import { ToastMessage } from "../ToastMessage";

interface Props {
    prescriptionId: number;
    updateList: () => Promise<void>;
    isDefault: boolean;
}

export function DeletePrescriptionModal({
    prescriptionId,
    updateList,
    isDefault,
}: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);

    async function deletePrescription() {
        setLoading(true);
        try {
            await deletePrescriptionModel(prescriptionId);
            await updateList();
            onClose();
            toast.success(
                <ToastMessage
                    title="Deletado"
                    description="Modelo excluido!"
                />,
            );
            setLoading(false);
        } catch (error) {
            toast.error(
                <ToastMessage
                    title="Erro!"
                    description="Tivemos algum problema, por favor tente mais tarde."
                />,
            );
        }
    }

    function wrapDeleteAddress() {
        void deletePrescription();
    }

    return (
        <>
            <ChakraButton
                height="max-content"
                margin={0}
                padding={0}
                width="100%"
                disabled={isDefault}
                borderBottom="1px"
                borderBottomColor="gray.500"
            >
                <MenuItem
                    onClick={isDefault ? () => {} : onOpen}
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
                        className="ri-delete-bin-line"
                        style={{ color: "#7D899D" }}
                    ></i>
                    <Text ml="4px">Excluir</Text>
                </MenuItem>
            </ChakraButton>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Deseja realmente excluir?
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontWeight={500}>
                            Ao deletar um modelo o mesmo não poderá mais ser
                            utilizado.
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
