import { Container, Flex, Text } from "@chakra-ui/react";
import { BoxTitle } from "../BoxTitle";
import { Input } from "../Input";
import { MedicineSearch } from "../medicineSearch";
import { Quantity } from "../Quantity";

interface Props {
    dosageValue: string | null;
    dosageId: string;
    index: number;
    handleChange: any;
    removeFunction: (index: number) => void;
    medicineIdValue: number | null;
    setFieldValue: any;
    quantityId: string;
    quantityName: string;
    quantityValue: number;
}

export function IndustrializedPrescription({
    dosageValue,
    dosageId,
    handleChange,
    removeFunction,
    index,
    medicineIdValue,
    setFieldValue,
    quantityId,
    quantityName,
    quantityValue,
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
            <Flex
                flexDirection="row"
                justifyContent="space-between"
                width="100%"
            >
                <BoxTitle text="Industrializado" />
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
            </Flex>
            <MedicineSearch
                medicineIdValue={medicineIdValue}
                index={index}
                setFieldValue={setFieldValue}
            />
            <Flex flexDirection="row">
                <Input
                    required
                    width="100%"
                    id={dosageId}
                    name={dosageId}
                    onChange={handleChange}
                    placeholder="Texto Posologia"
                    value={dosageValue as string}
                    paddingTopTextArea="15px"
                    textArea
                />
                <Quantity
                    quantityId={quantityId}
                    quantityName={quantityName}
                    quantityValue={quantityValue}
                    setFieldValue={setFieldValue}
                    index={index}
                />
            </Flex>
        </Container>
    );
}
