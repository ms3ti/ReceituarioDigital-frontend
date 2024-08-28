import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useEffect, useReducer, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Button,
    CreatePrescription,
    EditPatient,
    Header,
    SearchPatient,
} from "../../components";
import BackButton from "../../components/BackButton";
import { IListPatient } from "../../interfaces/patient/create.patient.dto";
import { IPrescriptionDto } from "../../interfaces/prescription/prescription.dto";
import { getPatientById } from "../../services/getPatientById";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { formatExtendedDate } from "../../utils/formatExtendedDate";

export function Prescription() {
    const navigate = useNavigate();
    const [patient, setPatient] = useState<IListPatient>();
    const [doctorName, setDoctorName] = useState<string>("");
    const [doctorId, setDoctorId] = useState<number>();
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [searchParams] = useSearchParams();

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

    async function setRawPrescription() {
        const obj = await asyncLocalStorage.getItem(
            localStorageKeys.TEMP_DOCUMENT,
        );
        const result = JSON.parse(String(obj));
        if (Object.keys(result).length > 0) {
            setPatient(result.patient);
        }
    }

    async function repeatPrescription() {
        const result = await asyncLocalStorage.getItem(
            localStorageKeys.PRESCRIPTION_REPEAT,
        );
        const prescription: IPrescriptionDto = JSON.parse(String(result));
        const patientResult = await getPatientById(prescription.patientId);
        setPatient(patientResult as IListPatient);
    }

    async function getPatient(patientId:string) {
        const patientResult = await getPatientById(Number(patientId));
        setPatient(patientResult as IListPatient);
    }

    useEffect(() => {
        void setRawPrescription();
        void getDoctorName();
        forceUpdate();
    }, [doctorName]);

    useEffect(() => {
        if (searchParams.get("repeat") === "true") {
            void repeatPrescription();
        }
        if (searchParams.get("reset") === "true") {
            setPatient(undefined);
            setDoctorName("");
            setDoctorId(undefined);
            window.location.search = "";
        }
        if (searchParams.get("patientId")?.length) {
            void getPatient(String(searchParams.get("patientId")))
        }
    }, [searchParams]);

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
                        <Text fontWeight={800}> Nova prescrição </Text>
                        <Text color="#3E4C62" fontWeight={500} fontSize={12}>
                            {formatExtendedDate(new Date())}
                        </Text>
                    </Flex>

                    
                    {patient ? (
                        <Flex
                            width={{ base: "99%", md: "1000px" }}
                            flexDirection="column"
                            alignItems="center"
                        >
                            <EditPatient
                                isMenuList={false}
                                patient={patient}
                                setPatient={setPatient}
                            />
                            <SearchPatient
                                setPatient={setPatient}
                                useButton={false}
                            />
                        </Flex>
                    ) : null}

                    <Flex
                        flexDirection="column"
                        flexWrap="wrap"
                        marginTop="15px"
                        width="100%"
                    >
                        {patient ? (
                            <CreatePrescription
                                patient={patient}
                                setPatient={setPatient}
                            />
                        ) : (
                            <Flex width="100%" direction="column" justifyContent="center" alignItems="center" gap={2}>
                            <SearchPatient setPatient={setPatient} useButton />
                            <Button
                                width={{ base: "300px", md: "330px" }}
                                type="submit"
                                height="47px"
                                onClick={() => {
                                    navigate("/emergencyDoc");
                                }}
                                text="Protocolo Contingência"
                                textColor="red.100"
                                bgColor="white.0"
                                border="1px solid rgba(215, 42, 52, 0.2)"
                                hasIcon={false}
                                fontSize={14}
                            />
                        </Flex>
                        )}
                    </Flex>
                </Box>
            </Center>
        </>
    );
}
