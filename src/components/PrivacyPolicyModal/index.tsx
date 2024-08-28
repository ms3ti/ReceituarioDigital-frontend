import {
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
import Iframe from "react-iframe";

export function ShowPrivacyPolicyModal() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Text as="u" onClick={onOpen} _hover={{ cursor: "pointer" }}>
                Política de Privacidade
            </Text>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader borderBottom="1px solid #EDEDF3">
                        {" "}
                        Politicas de Privacidade e Segurança
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        maxHeight={"xl"}
                        overflowY="auto"
                        style={{
                            width: "100%",
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Iframe
                            url={require("./termo.pdf")}
                            width="100%"
                            height="800px"
                            id=""
                            className=""
                            display="block"
                            position="relative"
                        />
                    </ModalBody>
                    <ModalFooter></ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
