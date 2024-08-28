import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useEffect, useReducer, useState } from "react";
import {
    CreateEmergencyDoc,
    Header
} from "../../components";
import BackButton from "../../components/BackButton";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { formatExtendedDate } from "../../utils/formatExtendedDate";

export function EmergencyDoc() {
    
    const [doctorName, setDoctorName] = useState<string>("");
    const [doctorId, setDoctorId] = useState<number>();
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);

    async function getDoctorName() {
        const docName = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_NAME,
        );
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        setDoctorName(String(docName));
        setDoctorId(Number(docId));
    }

    useEffect(() => {
        void getDoctorName();
        forceUpdate();
    }, [doctorName]);

    return (
        <>
            <Header id={Number(doctorId)} />
            <Center>
                <Box
                    width={{ base: "100%", md: "1000px" }}
                    paddingTop="10px"
                    className="prescription"
                    height="100vh"
                    padding={0}
                >
                    <Flex margin={5}>
                        <BackButton />
                    </Flex>
                    <Flex
                        flexDirection="row"
                        flexWrap="wrap"
                        justifyContent="space-between"
                        alignItems="center"
                        margin={5}
                    >
                        <Text fontWeight={800}>Documento emergencial</Text>
                        <Text color="#3E4C62" fontWeight={500} fontSize={12}>
                            {formatExtendedDate(new Date())}
                        </Text>
                    </Flex>

                    <Flex
                        flexDirection="column"
                        flexWrap="wrap"
                        marginTop="15px"
                        width="100%"
                    >
                        
                      <CreateEmergencyDoc />
                       
                    </Flex>
                </Box>
            </Center>
        </>
    );
}
