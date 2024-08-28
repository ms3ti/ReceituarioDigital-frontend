import {
    Box,
    Checkbox,
    Flex,
    Input,
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
import React, { useState } from "react";
import InputMask from "react-input-mask";
import { sendDocument } from "../../services/sendDocument";
import { removeMask } from "../../utils/removeMask";
import { Button } from "../Button";

interface Props {
    isOpen: boolean;
    callGetPdf: () => Promise<void>;
    loading: boolean;
    setShowShareDocument: React.Dispatch<React.SetStateAction<boolean>>;
    link: string;
    prescriptionId: number;
    cellphone: string;
    email: string;
}

export function SharedDocument({
    isOpen,
    callGetPdf,
    loading,
    setShowShareDocument,
    link,
    prescriptionId,
    cellphone,
    email,
}: Props) {
    const [checkWhats, setCheckWhats] = useState(true);
    const [checkEmail, setCheckEmail] = useState(true);
    const [checkSMS, setCheckSMS] = useState(true);
    const [isSend, setIsSend] = useState(false);
    const [valueWhats, setValueWhats] = useState(cellphone);
    const [valueEmail, setValueEmail] = useState(email);
    const [valueSMS, setValueSMS] = useState(cellphone);
    const [linkCopied, setLinkCopied] = useState(false);
    const { onClose } = useDisclosure();

    async function copyLink() {
        await navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => {
            setLinkCopied(false);
        }, 5000);
    }

    async function sendInfo() {
        setIsSend(true);
        const result = await sendDocument(
            prescriptionId,
            checkEmail ? valueEmail : "",
            checkSMS ? removeMask.whatsPhone(valueSMS) : "",
            checkWhats ? removeMask.whatsPhone(valueWhats) : "",
        );
        if (checkWhats && valueWhats) {
            window.open(result.whatsLink, "_blank");
        }

        setShowShareDocument(false);
        setIsSend(false);
    }

    return (
        <>
            <Modal
                isCentered
                isOpen={isOpen}
                onClose={() => {
                    setShowShareDocument(false);
                    onClose();
                }}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "md" }}
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Compartilhe o documento
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box>
                            <Text color="#7D899D" textAlign="center">
                                Como deseja enviar o documento para o paciente?
                            </Text>
                        </Box>
                        <Flex
                            id="shareDocumentList"
                            flexDirection="column"
                            marginBottom="20px"
                        >
                            <Flex
                                id="whatsapp"
                                flexDirection="row"
                                paddingTop="20px"
                                margin="auto"
                            >
                                <Box
                                    borderRadius="8px 0px 0px 8px"
                                    border="1px solid #EDEDF3"
                                    padding="12px"
                                    minW="126px"
                                >
                                    <Checkbox
                                        color="#202D46"
                                        colorScheme="red"
                                        checked={checkWhats}
                                        isChecked={checkWhats}
                                        onChange={() =>
                                            setCheckWhats(!checkWhats)
                                        }
                                    >
                                        WhatsApp
                                    </Checkbox>
                                </Box>
                                <Box
                                    borderRadius="0px 8px 8px 0px"
                                    width="80%"
                                    border="1px solid #EDEDF3"
                                >
                                    <Input
                                        border="none"
                                        color="#94A0B4"
                                        placeholder="(99) 99999-9999"
                                        height="100%"
                                        as={InputMask}
                                        mask="(99) 99999-9999"
                                        value={valueWhats}
                                        onChange={(e) =>
                                            setValueWhats(e.target.value)
                                        }
                                    />
                                </Box>
                            </Flex>
                            <Flex
                                id="email"
                                flexDirection="row"
                                paddingTop="20px"
                                margin="auto"
                            >
                                <Box
                                    borderRadius="8px 0px 0px 8px"
                                    border="1px solid #EDEDF3"
                                    padding="12px"
                                    minW="126px"
                                >
                                    <Checkbox
                                        color="#202D46"
                                        colorScheme="red"
                                        checked={checkEmail}
                                        isChecked={checkEmail}
                                        onChange={() =>
                                            setCheckEmail(!checkEmail)
                                        }
                                    >
                                        E-mail
                                    </Checkbox>
                                </Box>
                                <Box
                                    borderRadius="0px 8px 8px 0px"
                                    width="80%"
                                    border="1px solid #EDEDF3"
                                >
                                    <Input
                                        border="none"
                                        color="#94A0B4"
                                        placeholder="nome@exemplo.com"
                                        height="100%"
                                        value={valueEmail}
                                        onChange={(e) =>
                                            setValueEmail(e.target.value)
                                        }
                                    />
                                </Box>
                            </Flex>
                            <Flex
                                id="sms"
                                flexDirection="row"
                                paddingTop="20px"
                                margin="auto"
                            >
                                <Box
                                    borderRadius="8px 0px 0px 8px"
                                    border="1px solid #EDEDF3"
                                    padding="12px"
                                    minW="126px"
                                >
                                    <Checkbox
                                        color="#202D46"
                                        colorScheme="red"
                                        checked={checkSMS}
                                        isChecked={checkSMS}
                                        onChange={() => setCheckSMS(!checkSMS)}
                                    >
                                        SMS
                                    </Checkbox>
                                </Box>
                                <Box
                                    borderRadius="0px 8px 8px 0px"
                                    width="80%"
                                    border="1px solid #EDEDF3"
                                >
                                    <Input
                                        border="none"
                                        color="#94A0B4"
                                        placeholder="(99) 99999-9999"
                                        height="100%"
                                        value={valueSMS}
                                        onChange={(e) =>
                                            setValueSMS(e.target.value)
                                        }
                                        as={InputMask}
                                        mask="(99) 99999-9999"
                                    />
                                </Box>
                            </Flex>
                        </Flex>
                    </ModalBody>

                    <ModalFooter boxShadow="inset 0px 1px 0px #EDEDF3">
                        <Flex
                            width="100%"
                            flexDirection="column"
                            alignItems="center"
                            rowGap="16px"
                        >
                            <Button
                                isLoading={isSend}
                                disable={isSend}
                                bgColor="red.100"
                                text="Enviar"
                                fontSize={14}
                                width="100%"
                                height={"47px"}
                                textColor="white.100"
                                onClick={sendInfo}
                                hasIcon
                                icon={<i className="ri-send-plane-fill"></i>}
                            />
                            <Button
                                textColor="red.100"
                                text={
                                    linkCopied
                                        ? "Link copiado!"
                                        : "Copiar link do documento"
                                }
                                fontSize={14}
                                width="100%"
                                height={"47px"}
                                bgColor="#FFFFFF"
                                border="1px solid rgba(215, 42, 52, 0.2)"
                                onClick={copyLink}
                                hasIcon
                                icon={
                                    linkCopied ? (
                                        <i className="ri-link-unlink"></i>
                                    ) : (
                                        <i className="ri-link"></i>
                                    )
                                }
                            />
                            <Button
                                textColor="red.100"
                                text="Baixar em PDF"
                                fontSize={14}
                                width="100%"
                                height={"47px"}
                                bgColor="#FFFFFF"
                                border="1px solid rgba(215, 42, 52, 0.2)"
                                onClick={callGetPdf}
                                hasIcon
                                isLoading={loading}
                                icon={<i className="ri-download-fill"></i>}
                            />
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
