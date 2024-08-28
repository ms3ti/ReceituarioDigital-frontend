import { Box, Heading, Text } from "@chakra-ui/react";

interface Props {
    title: string;
    description?: string;
}

export function ToastMessage({ title, description }: Props) {
    return (
        <Box
            boxShadow="inset 1px 0px 0px #EDEDF3"
            paddingLeft="5px"
            backgroundColor="#FFFFFF"
        >
            <Heading fontWeight={900} color="#202D46">
                {title}
            </Heading>
            <Text color="#7D899D">{description}</Text>
        </Box>
    );
}
