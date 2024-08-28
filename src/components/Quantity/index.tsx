import { Button, Box, Text, Flex } from "@chakra-ui/react";
import { useReducer } from "react";

interface Props {
    quantityId: string;
    quantityName: string;
    quantityValue: number;
    setFieldValue: any;
    index: number;
}

export function Quantity({
    quantityId,
    quantityName,
    quantityValue,
    index,
    setFieldValue,
}: Props) {
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    return (
        <Box
            h="81px"
            border="1px solid #EDEDF3"
            borderRadius="8px"
            backgroundColor="white.10"
            textAlign="center"
            marginLeft="16px"
            justifyContent="center"
            marginTop="5px"
            paddingTop="5px"
        >
            <Text
                color="#7D899D"
                fontSize={11}
                fontWeight={600}
                marginBottom="10px"
            >
                Embalagem
            </Text>
            <Flex flexDirection="row">
                <Button
                    _hover={{
                        backgroundColor: "transparent",
                    }}
                    backgroundColor="transparent"
                    height="fit-content"
                    width="fit-content"
                    onClick={() => {
                        if (quantityValue > 1) {
                            setFieldValue(
                                `[${index}].quantity`,
                                Number(quantityValue) - 1,
                            );
                        }
                    }}
                    value={quantityValue}
                    id={quantityId}
                    name={quantityName}
                    isDisabled={quantityValue === 1}
                >
                    <i
                        className="ri-indeterminate-circle-fill"
                        style={{ color: "#94A0B4", fontSize: "20px" }}
                    ></i>
                </Button>

                {String(quantityValue)}
                <Button
                    _hover={{
                        backgroundColor: "transparent",
                    }}
                    backgroundColor="transparent"
                    height="fit-content"
                    width="fit-content"
                    onClick={() => {
                        setFieldValue(
                            `[${index}].quantity`,
                            Number(quantityValue) + 1,
                        );
                        forceUpdate();
                    }}
                    id={quantityId}
                    name={quantityName}
                    value={quantityValue}
                >
                    <i
                        className="ri-add-circle-fill"
                        style={{ color: "#94A0B4", fontSize: "20px" }}
                    ></i>
                </Button>
            </Flex>
        </Box>
    );
}
