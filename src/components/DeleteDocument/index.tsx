import {
    Box,
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
import { deletePrescription } from "../../services/deletePrescription";
import { Button } from "../Button";

interface Props {
    prescriptionId: number;
    resetList: (id?: number) => void;
}

export function DeleteDocument({ prescriptionId, resetList }: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);

    async function wrapDeletePrescription() {
        setLoading(true);
        await deletePrescription(prescriptionId);
        setLoading(false);
        resetList();
        onClose();
    }

    return (
        <>
            <Box
                textAlign="center"
                onClick={onOpen}
                cursor="pointer"
                minW="95px"
            >
                <i
                    className="ri-delete-bin-7-line"
                    style={{
                        color: "#94A0B4",
                        fontSize: "25px",
                        alignSelf: "flex-end",
                    }}
                ></i>
                <Text fontSize="16px" color="gray.200" fontWeight={500}>
                    Deletar
                </Text>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent
                    backgroundColor="white"
                    position={{ base: "fixed", md: "absolute" }}
                    marginBottom="0px"
                    borderRadius="18px"
                    borderEndEndRadius={{ base: 0, md: "18px" }}
                    borderEndStartRadius={{ base: 0, md: "18px" }}
                    width="100%"
                    bottom={{ base: "0px", md: "40vh" }}
                >
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Deseja realmente excluir?
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontWeight={500}>
                            Ao deletar um documento, ele não irá mais aparecer
                            em seu histórico, e não existirá acesso ao mesmo.
                        </Text>
                    </ModalBody>

                    <ModalFooter boxShadow="inset 0px 1px 0px #EDEDF3">
                        <Button
                            disable={loading}
                            isLoading={loading}
                            text="Sim, excluir"
                            bgColor="#D72A34"
                            textColor="#FFFFFF"
                            fontSize={14}
                            hasIcon={false}
                            type="submit"
                            onClick={wrapDeletePrescription}
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
