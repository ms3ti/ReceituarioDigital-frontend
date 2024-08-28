import { Container, Flex, Text } from "@chakra-ui/react";
import { Input, FormError, BoxTitle } from "../../components";

interface Props {
    index: number;
    handleChange: any;
    descriptionValue: string;
    descriptionId: string;
    removeFunction: (index: number) => void;
    label: string;
    showRemoveButton: boolean;
    placeholder: string;
    textArea?: boolean;
    paddingTopTextArea?: string;
}

export function FreeTextPrescription({
    descriptionId,
    descriptionValue,
    handleChange,
    index,
    removeFunction,
    label,
    showRemoveButton,
    placeholder,
    textArea = false,
    paddingTopTextArea = "10px",
}: Props) {
    return (
        <Container
            backgroundColor={"#F7F8FA"}
            paddingTop="15px"
            paddingBottom="15px"
            marginTop="10px"
            marginBottom="10px"
            maxWidth="100%"
            borderRadius="4px"
            boxShadow="md"
            style={{
                WebkitMarginStart: "0px",
            }}
        >
            <Flex flexDirection="row" justifyContent="space-between">
                <BoxTitle text={label} />
                {showRemoveButton ? (
                    <Text
                        fontWeight={800}
                        color="#7D899D"
                        fontSize="12px"
                        textDecorationLine="underline"
                        alignSelf="self-end"
                        _hover={{
                            cursor: "pointer",
                        }}
                        onClick={() => removeFunction(index)}
                    >
                        Remover
                    </Text>
                ) : null}
            </Flex>
            <Input
                required
                id={descriptionId}
                name={descriptionId}
                onChange={handleChange}
                placeholder={placeholder}
                value={descriptionValue}
                textArea={textArea}
                paddingTopTextArea={paddingTopTextArea}
            />
            {descriptionValue === "" ? (
                <FormError message="A campo é obrigatório" />
            ) : null}
        </Container>
    );
}
