import { Flex, Checkbox, Text, Box } from "@chakra-ui/react";
import { IMedicalExamDto } from "../../interfaces/prescription/medical.exam.dto";
import { capitalizeFirstLetter } from "../../utils/capilatilize";

interface Props {
    checked: boolean;
    changeValue: any;
    title: string;
    value: IMedicalExamDto;
}

export function Item({ changeValue, checked, title, value }: Props) {
    return (
        <Box
            backgroundColor="#FFFFFF"
            boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
            borderRadius="8px"
            border="red.100"
            width="100%"
            height="8vh"
            py="10px"
            my="5px"
        >
            <Flex
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
                height="100%"
            >
                <Checkbox
                    id="model"
                    ml="20px"
                    colorScheme="red"
                    isChecked={checked}
                    onChange={changeValue}
                    value={value.id}
                />
                <Box width="80%" maxHeight="64px" ml={{ base: "8px" }}>
                    <Text fontWeight={900} color="#202D46">
                        {capitalizeFirstLetter(title)}
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
}
