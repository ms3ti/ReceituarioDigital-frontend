/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Container, Text } from "@chakra-ui/react";

interface Props {
    value: number | string;
    label: string;
}

export function FlushedInput({ value, label }: Props) {
    return (
        <Container
            boxShadow="inset 0px -1px 0px #EDEDF3"
            paddingLeft="10px"
            paddingRight="10px"
            marginBottom="15px"
        >
            <Text color="gray.400" fontWeight={400}>
                {label}
            </Text>
            <Text fontWeight={900} color="blue.200" paddingBottom="15px">
                {!value || value === "undefined" ? "Não cadastrado" : value}
            </Text>
        </Container>
    );
}
