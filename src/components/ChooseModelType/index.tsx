import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { Button } from "../Button";
import { ListPrescriptionModel } from "../ListPrescriptionModel";
import { SquareButton } from "../SquareButton";

export default function ChooseModelType() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpenList,
        onOpen: openList,
        onClose: closeList,
    } = useDisclosure();
    const [documentTypeId, setDocumentTypeId] = useState<number>(0);

    function close() {
        onClose();
    }
    function selectModelType(typeId: number) {
        setDocumentTypeId(typeId);
        openList();
    }
    return (
        <>
            <SquareButton
                bgColor="#FFFFFF"
                height="47px"
                onClick={onOpen}
                maxWidth="238px"
                textColor="#202D46"
                textAlign="left"
                text={"Meus modelos"}
                width="90%"
                hasIcon
                icon={
                    <i
                        className="ri-health-book-line"
                        style={{ color: "#D72A34" }}
                    ></i>
                }
                fontSize={12}
                border="1px solid #EDEDF3"
                borderRadius="8px"
            />
            <Modal
                isOpen={isOpen}
                onClose={close}
                motionPreset="slideInBottom"
                scrollBehavior="inside"
                isCentered
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Selecione o tipo de modelo
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex
                            flexDirection="column"
                            gap="10px"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Button
                                bgColor="#FFFFFF"
                                height="47px"
                                onClick={() => selectModelType(1)}
                                maxWidth="238px"
                                textColor="#D72A34"
                                text="Prescrição"
                                width="90%"
                                hasIcon={false}
                                fontSize={14}
                                border="1px solid #D72A34"
                                borderRadius="8px"
                            />
                            <Button
                                bgColor="#FFFFFF"
                                height="47px"
                                onClick={() => selectModelType(2)}
                                maxWidth="238px"
                                textColor="#D72A34"
                                text="Pedido de exame"
                                width="90%"
                                hasIcon={false}
                                fontSize={14}
                                border="1px solid #D72A34"
                                borderRadius="8px"
                            />
                            <Button
                                bgColor="#FFFFFF"
                                height="47px"
                                onClick={() => selectModelType(3)}
                                maxWidth="238px"
                                textColor="#D72A34"
                                text="Atestado"
                                width="90%"
                                hasIcon={false}
                                fontSize={14}
                                border="1px solid #D72A34"
                                borderRadius="8px"
                            />
                            <Button
                                bgColor="#FFFFFF"
                                height="47px"
                                onClick={() => selectModelType(4)}
                                maxWidth="238px"
                                textColor="#D72A34"
                                text="Outro documento"
                                width="90%"
                                hasIcon={false}
                                fontSize={14}
                                border="1px solid #D72A34"
                                borderRadius="8px"
                            />
                        </Flex>
                    </ModalBody>

                    <ModalFooter>
                        {documentTypeId ? (
                            <ListPrescriptionModel
                                show={false}
                                documentTypeId={documentTypeId}
                                saveRawPrescription={async () =>
                                    await Promise.resolve()
                                }
                                setModelToPrescription={async () =>
                                    await Promise.resolve()
                                }
                                openAutomatically={isOpenList}
                                useButton={false}
                                closeList={closeList}
                                openList={openList}
                                isEditPrescription={false}
                                isFromMainPage
                            />
                        ) : null}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
