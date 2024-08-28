import { Box, Checkbox, Flex, Text } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";

interface Props {
    setShowDateOnPDF: Dispatch<SetStateAction<boolean>>;
    showDateOnPDF: boolean;
}

export function ShouldShowDateOnPDF({
    setShowDateOnPDF,
    showDateOnPDF,
}: Props) {
    return (
        <Box
            backgroundColor={"#F7F8FA"}
            padding="15px"
            width="100"
            marginBottom="20px"
            marginTop="10px"
            borderRadius="4px"
            boxShadow="md"
        >
            <Flex flexDirection="row" alignItems="center">
                <Checkbox
                    isChecked={showDateOnPDF}
                    colorScheme="red"
                    onChange={() => setShowDateOnPDF(!showDateOnPDF)}
                    checked={showDateOnPDF}
                />
                <Text
                    marginLeft="14px"
                    fontWeight={700}
                    color="#7D899D"
                    fontSize={14}
                >
                    Exibir data no documento PDF
                </Text>
            </Flex>
        </Box>
    );
}
