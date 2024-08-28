import { Box, Center, Checkbox, Flex, Text } from "@chakra-ui/react";

interface Props {
    assigned: boolean;
}

export default function ToSignButton({ assigned }: Props) {
    return (
        <Center>
            <Box
                backgroundColor="white"
                width={{ base: "90%", md: "335px" }}
                height="40%"
                margin="15px"
                paddingTop="10px"
                paddingBottom="10px"
                border="1px solid #EDEDF3"
                boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
                borderRadius="8px"
            >
                <Flex
                    flexDirection="row"
                    justifyContent="space-evenly"
                    alignItems="center"
                >
                    <Center
                        w="60px"
                        h="60px"
                        backgroundColor="rgba(28, 193, 98, 0.05)"
                        borderRadius="4px"
                        padding="8px"
                    >
                        <i
                            className="ri-fingerprint-line"
                            style={{
                                color: "#1CC162",
                                fontSize: "35px",
                            }}
                        ></i>
                    </Center>
                    <Box>
                        <Text color="blue.200" fontWeight={900}>
                            Assinar digitalmente?
                        </Text>
                        <Text color="gray.100" fontWeight={500}>
                            Token: 81239
                        </Text>
                    </Box>
                    <Box>
                        <Checkbox
                            colorScheme="green"
                            isChecked={assigned}
                            readOnly
                        />
                    </Box>
                </Flex>
            </Box>
        </Center>
    );
}
