import { Box, Flex, Text } from "@chakra-ui/react";
import { specilityByCouncil } from "../../utils/enum/council.enum";
import { BoxTitle } from "../BoxTitle";
import { FormError } from "../FormError";
import { Input } from "../Input";
import { Select } from "../Select";

interface Props {
    specialityNameValue: string | number | readonly string[] | undefined;
    specialityNameHandleChange: any;
    specialityId: string;
    reqHandleChange: any;
    rqeValue: string | number | readonly string[] | undefined;
    rqeId: string;
    removeSpecialityModalFunction: any;
    rqeError: string | null | undefined;
    specialityError: string | null;
    council: string;
    index?: number;
}

export function Specialty({
    reqHandleChange,
    rqeValue,
    rqeId,
    specialityNameHandleChange,
    specialityNameValue,
    specialityId,
    removeSpecialityModalFunction,
    rqeError,
    specialityError,
    index,
    council,
}: Props) {
    const isCRMV =
        council === "CRMV - Conselho Regional de Medicina Veterinária";
    const isCRM = council === "CRM - Conselho Regional de Medicina";
    function rqeErrorGenerate() {
        if (!isCRM && !isCRMV) {
            return "";
        } else {
            if (String(rqeValue).length > 10) {
                return "O campo deve conter no máximo 10 caracteres";
            } else if (String(rqeValue).length === 0) {
                return `O ${isCRMV ? "MAPA" : "RQE"} é obrigatório`;
            } else {
                return "";
            }
        }
    }
    return (
        <Box backgroundColor={"#F7F8FA"} padding="15px" width="100%">
            <Flex flexDirection="row" justifyContent="space-between">
                <BoxTitle text="Especialidade" />
                <Text
                    fontWeight={800}
                    color="#7D899D"
                    fontSize="12px"
                    textDecorationLine="underline"
                    alignSelf="self-end"
                    _hover={{
                        cursor: "pointer",
                    }}
                    onClick={() => removeSpecialityModalFunction()}
                >
                    Remover
                </Text>
            </Flex>

            <Flex
                flexDirection="column"
                minHeight="100%"
                width={{ base: "100%", md: "100%" }}
                justifyContent="space-evenly"
            >
                <Box display={{ base: "block", md: "flex" }}>
                    <Flex
                        width={{ base: "100%", md: "98%" }}
                        flexDirection="column"
                    >
                        <Select
                            width={{
                                base: "100%",
                                md:
                                    isCRM || (isCRMV && Number(index) === 0)
                                        ? "98%"
                                        : "102%",
                            }}
                            placeholder="Nome da especialidade"
                            value={String(specialityNameValue)}
                            onChange={specialityNameHandleChange}
                            id={specialityId}
                            name={specialityId}
                            options={specilityByCouncil[council]}
                        />

                        <FormError message={String(specialityError)} />
                    </Flex>
                    {isCRM || isCRMV ? (
                        <>
                            {(isCRMV && Number(index) === 0) || isCRM ? (
                                <Flex width="100%" flexDirection="column">
                                    <Input
                                        width="100%"
                                        placeholder={isCRMV ? "MAPA" : "RQE"}
                                        value={rqeValue}
                                        onChange={reqHandleChange}
                                        id={rqeId}
                                        name={rqeId}
                                        maxLength={10}
                                    />
                                    <FormError
                                        message={String(rqeErrorGenerate())}
                                    />
                                </Flex>
                            ) : null}
                        </>
                    ) : null}
                </Box>
            </Flex>
        </Box>
    );
}
