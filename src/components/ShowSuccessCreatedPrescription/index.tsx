import {
    Flex,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPrintInfo } from "../../services/getPrintInfo";
import { Button } from "../Button";

interface Props {
    onOpen: () => void;
    onClose: () => void;
    isOpen: boolean;
    buttonText: string;
    id: string;
    prescriptionId: number;
}

export function ShowSuccessCreatedPrescription({
    buttonText,
    isOpen,
    onClose,
    onOpen,
    id,
    prescriptionId,
}: Props) {
    const [loading, setLoading] = useState(false);

    async function downloadDocument() {
        setLoading(true);
        const result = await getPrintInfo(prescriptionId);
        setLoading(false);
        const linkSource = `data:application/pdf;base64,${String(
            result.buffer,
        )}`;
        const downloadLink = document.createElement("a");
        const fileName = `${String(result?.fileName)}.pdf`;
        downloadLink.target = "__blank";
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }
    const navigate = useNavigate();
    return (
        <React.Fragment>
            <Button
                text={buttonText}
                onClick={onOpen}
                bgColor={""}
                textColor={""}
                fontSize={10}
                hasIcon={false}
            />

            <Modal
                isOpen={isOpen}
                onClose={() => {
                    navigate(`/showPrescriptions/${Number(id)}`);
                    onClose();
                }}
                motionPreset="slideInBottom"
                isCentered
                size={{ base: "sm", md: "md" }}
            >
                <ModalOverlay height="100vh" />
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
                        Documento gerado!
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex
                            width="100%"
                            height="100%"
                            justifyContent="center"
                            alignContent="center"
                        >
                            <Image src="/logo/checkimg.svg" />
                        </Flex>
                    </ModalBody>

                    <ModalFooter justifyContent="center">
                        <Flex
                            flexDirection="column"
                            width="90%"
                            height="19vh"
                            justifyContent="space-evenly"
                        >
                            <Button
                                marginTop="10px"
                                disable={loading}
                                isLoading={loading}
                                width="100%"
                                height="48px"
                                bgColor="red.100"
                                textColor="white.10"
                                text="Baixar em PDF"
                                onClick={downloadDocument}
                                hasIcon
                                icon={
                                    <i
                                        className="ri-download-line"
                                        style={{ color: "#FFFFFF" }}
                                    ></i>
                                }
                                fontSize={15}
                                fontWeight={750}
                            />
                            <Button
                                marginTop="10px"
                                fontWeight={750}
                                width="100%"
                                height="48px"
                                textColor="red.100"
                                bgColor="white.10"
                                border="1px solid rgba(215, 42, 52, 0.2);"
                                text="Novo documento"
                                onClick={() => {
                                    navigate("/prescription?reset=true");
                                    onClose();
                                }}
                                hasIcon
                                icon={
                                    <i
                                        className="ri-medicine-bottle-line"
                                        style={{ color: "#D72A34" }}
                                    ></i>
                                }
                                fontSize={15}
                            />
                            <Button
                                fontWeight={750}
                                width="100%"
                                height="48px"
                                marginTop="10px"
                                textColor="red.100"
                                bgColor="white.10"
                                border="1px solid rgba(215, 42, 52, 0.2);"
                                text="Voltar ao início"
                                onClick={() => {
                                    navigate(
                                        `/showPrescriptions/${Number(id)}`,
                                    );
                                    onClose();
                                }}
                                hasIcon
                                icon={
                                    <i
                                        className="ri-home-4-line"
                                        style={{
                                            color: "#D72A34",
                                        }}
                                    ></i>
                                }
                                fontSize={15}
                            />
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}
