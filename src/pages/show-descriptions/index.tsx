import { useState, useReducer, useEffect } from "react";
import { Box, Container, Flex, Text } from "@chakra-ui/react";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { Header, ShowPrescription } from "../../components";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";

export function ShowPrescriptions() {
    const [doctorId, setDoctorId] = useState<number>();
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);

    async function getDoctorName() {
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );

        setDoctorId(Number(docId));
    }

    useEffect(() => {
        void getDoctorName();
        forceUpdate();
    }, [doctorId]);

    return (
        <>
            <Header id={Number(doctorId)} />

            <Box
                width="100vw"
                maxHeight="110px"
                backgroundColor="white.100"
                pt="25px"
            >
                <Container
                    maxW={["367px", "1000px"]}
                    justifyContent={{ base: "center", md: "flex-start" }}
                    alignItems="center"
                    padding={"15px"}
                >
                    <Flex
                        flexDirection="column"
                        flexWrap="nowrap"
                        justifyContent="space-between"
                        height={30}
                    >
                        <Text fontWeight={800}>O que deseja fazer?</Text>
                    </Flex>
                    <Flex flexDirection="row" flexWrap="nowrap">
                        <ShowPrescription />
                    </Flex>
                </Container>
            </Box>
        </>
    );
}
