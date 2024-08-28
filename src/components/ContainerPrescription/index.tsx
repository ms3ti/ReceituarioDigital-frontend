import { Box, Flex, Text } from "@chakra-ui/react";
interface PrescriptionProps {
    name: string;
    createDate: string;
    updateDate: string;
    assign: boolean;
}
interface Props {
    date?: string[];
    data?: PrescriptionProps[];
}

export default function ContainerPrescription({ date, data }: Props) {
    return (
        <Box
            padding="15px"
            width="100%"
            height="auto"
            borderRadius={4}
            border="1px solid #EDEDF3"
            my={2}
        >
            <Flex
                flexDirection="column"
                minHeight="30px"
                justifyContent="space-evenly"
            >
                <Text px={"4px"} fontWeight={900}>
                    {date}
                </Text>

                <Text px={"4px"} fontWeight={900}>
                    {JSON.stringify(data)}
                </Text>
            </Flex>
        </Box>
    );
}
