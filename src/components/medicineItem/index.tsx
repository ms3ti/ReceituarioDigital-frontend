import { Box, Checkbox, Flex, Text } from "@chakra-ui/react";
import { IMedicineDto } from "../../interfaces/prescription/medicine.dto";

interface Props {
    checked: boolean;
    changeValue: any;
    value: IMedicineDto;
}

export function MedicineItem({ changeValue, checked, value }: Props) {
    return (
        <Box
            backgroundColor="#fff"
            boxShadow="2px 4px 12px rgba(64, 70, 82, 0.05)"
            borderRadius="8px"
            width="100%"
            height="auto"
            py="8px"
            my="8px"
        >
            <Flex
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                height="100%"
                py="8px"
            >
                <Checkbox
                    id="model"
                    ml="20px"
                    colorScheme="red"
                    isChecked={checked}
                    onChange={changeValue}
                    value={value.id}
                />
                <Box
                    width="80%"
                    maxHeight="fit-content"
                    ml={{ base: "8px" }}
                    height="fit-content"
                >
                    <Text fontSize="15px" fontWeight={900} color="#202D46">
                        {value.substance.length
                            ? `${value.substance}, ${value.product}`
                            : `${value.product}`}
                    </Text>
                    <Text fontSize="13px" fontWeight={400} color="#3E4C62">
                        {value.presentation}
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
}
