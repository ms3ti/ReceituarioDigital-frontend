import { Box, Divider, Flex, Text } from "@chakra-ui/react";
import { IPrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/prescriptionComposition.dto";
import { dateToSlash } from "../../utils/dateToSlash";

interface Props {
    data?: IPrescriptionCompositionDto;
    title?: IPrescriptionCompositionDto;
    content?: IPrescriptionCompositionDto;
    date?: string;
    hour?: string;
}

export default function CertificateItem({
    data,
    date,
    hour,
    content,
    title,
}: Props) {
    return (
        <Box
            marginY={"6px"}
            padding="15px"
            width="100%"
            borderRadius={8}
            border="1px solid #EDEDF3"
        >
            <Flex
                flexDirection="row"
                justifyContent="flex-start"
                borderBottom={"0px"}
                width="100%"
                borderBottomColor="gray.500"
            >
                <Flex
                    flexDirection="column"
                    flexWrap="wrap"
                    justifyContent="flex-start"
                    width="100%"
                >
                    {data?.isOrientation && date && hour ? (
                        <>
                            <Text
                                fontWeight={900}
                                fontSize={"14px"}
                                width="100%"
                                mb="4px"
                            >
                                Atendimento {dateToSlash(String(date))} as{" "}
                                {hour}{" "}
                            </Text>
                            <Divider
                                borderColor="gray.500"
                                width="100%"
                                my="4px"
                            />
                        </>
                    ) : null}

                    {!title &&
                    !content &&
                    !data?.isContent &&
                    !data?.examId &&
                    data?.description ? (
                        <Text
                            fontSize={"sm"}
                            fontWeight={400}
                            my="4px"
                            wordBreak="break-all"
                        >
                            {data?.description}
                        </Text>
                    ) : null}

                    {title && content ? (
                        <>
                            <Text
                                fontWeight={900}
                                fontSize={"14px"}
                                width="100%"
                                mb="4px"
                                wordBreak="break-all"
                            >
                                {title.description}
                            </Text>
                            <Divider
                                borderColor="gray.500"
                                width="100%"
                                my="4px"
                            />
                            <Text
                                fontSize={"sm"}
                                fontWeight={400}
                                my="4px"
                                wordBreak="break-all"
                            >
                                {content?.description}
                            </Text>
                        </>
                    ) : null}
                </Flex>
            </Flex>
        </Box>
    );
}
