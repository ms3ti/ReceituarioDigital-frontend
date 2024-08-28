import { Text } from "@chakra-ui/react";

interface Props {
    message: string | undefined;
}

export function FormError({ message = "" }: Props) {
    const condition = message.length > 0 && message !== "undefined";
    return condition ? (
        <Text marginLeft="8px" fontSize="14px" color="#E53E3E">
            {message}
        </Text>
    ) : (
        <p></p>
    );
}
