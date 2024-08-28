import {
    useDisclosure,
    Modal,
    ModalOverlay,
    Text,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Flex,
    ListItem,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { ToastMessage } from "../ToastMessage";
import { deletePatient } from "../../services/deletePatient";
import { Button } from "../Button";
import { useAccount } from "../../contexts/accountContext";

interface Props {
    id: number;
    setSearchWord: Dispatch<SetStateAction<string>>;
}

export function DeletePatientModal({ id, setSearchWord }: Props) {
    const account = useAccount();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);

    async function wrapDeletePatient() {
        try {
            setLoading(true);
            await deletePatient(id);
            setSearchWord("searchWord");
            toast.success(
                <ToastMessage
                    title={`${
                        Number(account.councilId) === 2
                            ? "Proprietário"
                            : "Paciente"
                    } excluido!`}
                />,
            );
            onClose();
            setLoading(false);
        } catch (error) {
            toast.error(
                <ToastMessage
                    title="Erro"
                    description="Tivemos algum problema, por favor tente mais tarde."
                />,
            );
        }
    }
    return (
        <>
            <ListItem
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
                paddingLeft="10px"
                onClick={onOpen}
            >
                <Flex
                    alignItems="center"
                    justifyContent="start"
                    flexDirection="row"
                >
                    <i
                        className="ri-delete-bin-line"
                        style={{
                            color: "#7D899D",
                            marginRight: "7px",
                            marginBottom: "2px",
                        }}
                    ></i>
                    <Text>Excluir</Text>
                </Flex>
            </ListItem>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Deseja realmente excluir?
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontWeight={500}>
                            Ao deletar um{" "}
                            {Number(account.councilId) === 2
                                ? "proprietário"
                                : "paciente"}{" "}
                            o mesmo não poderá mais ser utilizado nas
                            prescrições.
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
                            onClick={wrapDeletePatient}
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
