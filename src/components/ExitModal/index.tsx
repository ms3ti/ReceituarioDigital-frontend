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
import { Button } from "../Button";

export function ExitModal({ onClick }: any) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Box
                width="33%"
                onClick={onOpen}
                textAlign="center"
                _hover={{
                    cursor: "pointer",
                }}
            >
                <i
                    className="ri-logout-box-r-line"
                    style={{
                        color: "#94A0B4",
                        fontSize: "25px",
                        alignSelf: "flex-end",
                    }}
                ></i>
                <Text color="gray.200" fontWeight={500}>
                    Sair da conta!
                </Text>
            </Box>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
                isCentered
                size={{ base: "md", md: "sm" }}
            >
                <ModalOverlay />
                <ModalContent
                    backgroundColor="white"
                    position={{ base: "fixed", md: "absolute" }}
                    marginBottom="0px"
                    borderRadius={{ base: "18px", md: "8px" }}
                    width="100%"
                    bottom={{ base: "0px", md: "35%" }}
                >
                    <ModalHeader borderBottom="1px solid #EDEDF3">
                        Deseja realmente sair?
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb="20px" pt="10px">
                        Ao desconetar sua conta nenhum dado é perdido, sua conta
                        será apenas desconectada
                    </ModalBody>
                    <ModalFooter borderTop="1px solid #EDEDF3">
                        <Button
                            onClick={onClick}
                            width={"100%"}
                            height={"47px"}
                            variant="solid"
                            hasIcon={false}
                            bgColor="red.100"
                            text="Sim, sair da minha conta"
                            textColor="#FFFFFF"
                            type="submit"
                            fontSize={14}
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
