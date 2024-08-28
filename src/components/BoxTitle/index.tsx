import { Text } from "@chakra-ui/react";

interface Props {
    text: string;
}
export function BoxTitle({ text }: Props) {
    return (
        <Text fontWeight={900} fontSize={13} color="#7D899D" marginLeft="7px">
            {text}
        </Text>
    );
}
