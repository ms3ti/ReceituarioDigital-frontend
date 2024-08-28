import { Box, Center, Flex, Text, useMediaQuery } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IMedicineDto } from "../../interfaces/prescription/medicine.dto";
import { IPrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/prescriptionComposition.dto";
import { getMedicineById } from "../../services/getMedicineById";
interface Props {
    data: IPrescriptionCompositionDto;
}

export default function PrescriptionItem({ data }: Props) {
    const [isLargerThan800] = useMediaQuery("(min-width: 800px)");
    const isFreeText =
        (data.medicine === null || data.medicine === "") &&
        (data.activePrinciple === null || data.activePrinciple === "") &&
        (data.dosage === null || data.dosage === "") &&
        (data.packing === null || data.packing === "") &&
        !data.examId &&
        !data.medicineId;

    const [medicine, setMedicine] = useState<IMedicineDto>();

    async function getInfo() {
        const result = await getMedicineById(data.medicineId);
        setMedicine(result);
    }
    const IconMedicineBottle = () => (
        <i style={{ fontSize: "25px" }} className="ri-medicine-bottle-line"></i>
    );

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
                borderBottom={isFreeText ? "0px" : "1px"}
                borderBottomColor="gray.500"
            >
                {isFreeText ? null : (
                    <Center
                        color={"red.100"}
                        width={"40px"}
                        height={"40px"}
                        minWidth="40px"
                        minHeight="40px"
                        borderRadius={"4px"}
                        background={"rgba(215, 42, 52, 0.05)"}
                        aria-label="Icon Prescription"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Flex
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            width={"100%"}
                        >
                            <IconMedicineBottle />
                        </Flex>
                    </Center>
                )}

                {isFreeText ? (
                    <Flex flexDirection="column" flexWrap="wrap">
                        <Text
                            fontSize={"sm"}
                            fontWeight={400}
                            pt="8px"
                            wordBreak="break-all"
                        >
                            {data?.description}
                        </Text>
                    </Flex>
                ) : (
                    <Flex
                        ml={"8px"}
                        flexDirection="column"
                        flexWrap="wrap"
                        justifyContent="flex-start"
                        pb="8px"
                        maxWidth="450px"
                    >
                        <Text
                            fontSize="15px"
                            fontWeight={900}
                            color="#202D46"
                        >{`${medicine?.substance}, ${medicine?.product}`}</Text>
                        <Text fontSize="13px" fontWeight={400} color="#3E4C62">
                            {medicine?.presentation}
                        </Text>
                    </Flex>
                )}
                {data.quantity ? (
                    <Text
                        textAlign="right"
                        fontWeight={700}
                        color="#202D46"
                        fontSize={12}
                        marginLeft="auto"
                        width="110px"
                    >
                        {data.quantity > 1
                            ? `${data.quantity} ${isLargerThan800 ? "Embalagens" : "Emb."}`
                            : ` ${data.quantity} ${isLargerThan800 ? "Embalagem" : "Emb."}`
                        } 
                    </Text>
                ) : null}
            </Flex>
            <Flex
                flexDirection="column"
                flexWrap="wrap"
                justifyContent="flex-start"
                alignItems="flex-start"
                pt="12px"
            >
                <Text fontSize={"sm"} fontWeight={"400"} wordBreak="break-all">
                    {data?.dosage}
                </Text>
            </Flex>
        </Box>
    );
}
