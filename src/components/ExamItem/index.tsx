import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IMedicalExamDto } from "../../interfaces/prescription/medical.exam.dto";
import { getExamById } from "../../services/getExamById";
import { capitalizeFirstLetter } from "../../utils/capilatilize";

interface Props {
    examId: number;
}

export default function ExamItem({ examId }: Props) {
    const [exam, setExam] = useState<IMedicalExamDto>();
    async function getInfo() {
        const result = await getExamById(examId);
        setExam(result);
    }

    useEffect(() => {
        void getInfo();
    }, []);

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
                width="100%"
                borderBottomColor="gray.500"
            >
                <Flex
                    backgroundColor="rgba(215, 42, 52, 0.05)"
                    borderRadius="4px"
                    h="40px"
                    w="40px"
                    minW=" 40px"
                    alignItems="center"
                    justifyContent="center"
                >
                    <i
                        className="ri-test-tube-line"
                        style={{
                            color: "red",
                            fontSize: "25px",
                        }}
                    ></i>
                </Flex>
                <Text
                    fontSize={"sm"}
                    fontWeight={900}
                    my="2px"
                    marginLeft="10px"
                    color="#202D46"
                    alignSelf="center"
                >
                    {capitalizeFirstLetter(String(exam?.name))}
                </Text>
            </Flex>
        </Box>
    );
}
