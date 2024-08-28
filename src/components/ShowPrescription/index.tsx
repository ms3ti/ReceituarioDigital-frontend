/* eslint-disable react/no-children-prop */
import {
    Center,
    Flex,
    Input,
    InputGroup,
    Text,
    useDisclosure,
    Box,
    useMediaQuery,
    Button as ChakraButton,
} from "@chakra-ui/react";
import React, { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatToDateTime } from "brazilian-values";
import ReactLoading from "react-loading";

import { IPrescriptionsOrganizedByDateDto } from "../../interfaces/prescription/list.prescription.dto";
import { listPrescription } from "../../services/listPrescriptions";
import { showPrescriptionCompositions } from "../../services/showPrescriptionCompositions";
import CardPrescriptions from "../CardPrescriptions";
import { IPrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/prescriptionComposition.dto";
import { IPatientDto } from "../../interfaces/patient/patient.dto";
import { ShowPrescriptionDetails } from "../ShowPrescriptionDetails";
import { formatDateSimple } from "../../utils/formatDateSimple";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { validAdminEmails } from "../../utils/validAdminEmails";
import { useAccount } from "../../contexts/accountContext";
import { SearchPatient } from "../SearchPatient";
import ChooseModelType from "../ChooseModelType";
import { SquareButton } from "../SquareButton";
import { motion } from "framer-motion";

export default function ShowPrescription() {
    const navigate = useNavigate();
    const account = useAccount();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [openPatient, setOpenPatient] = useState(false);
    const [assigned, setAssigned] = useState(false);
    const [page, setPage] = useState(1);
    const [total] = useState(10);
    const [text, setText] = useState<string>("");
    const [animal, setAnimal] = useState<string>("");
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [precrisptionId, setPrescriptionId] = useState<number>();
    const [person, setPerson] = useState<IPatientDto>();
    const [patientCPF, setPatientCPF] = useState<string>("");
    const [personId, setPersonId] = useState<number>();
    const [prescriptions, setPrescriptions] =
        useState<IPrescriptionsOrganizedByDateDto>({});
    const [prescriptionsCompositions, setPrescriptionsCompositions] =
        useState<IPrescriptionCompositionDto | null>();
    const [compositions, setCompositions] = useState<
        IPrescriptionCompositionDto[]
    >([]);
    const [email, setEmail] = useState<string>("");
    const [clearPrescriptions, setClearPrescriptions] =
        useState<boolean>(false);

    const {
        isOpen: isOpenPatientList,
        onOpen: onOpenPatientList,
        onClose: onClosePatientList,
    } = useDisclosure();
    async function getEmail() {
        const email = await asyncLocalStorage.getItem(localStorageKeys.EMAIL);
        setEmail(String(email).replaceAll('"', ""));
    }

    async function getPrescriptions(resetPrescription = false) {
        setLoading(true);
        let searchType: "Tutor" | "Animal" | "Ambos" = "Tutor";

        if (animal.length === 0 && text.length > 0) {
            searchType = "Tutor";
        }
        if (animal.length === 0 && text.length === 0) {
            searchType = "Tutor";
        }
        if (animal.length > 0 && text.length === 0) {
            searchType = "Animal";
        }
        if (animal.length > 0 && text.length > 0) {
            searchType = "Ambos";
        }
        const resetList = resetPrescription === undefined ? clearPrescriptions : resetPrescription
        const id = await asyncLocalStorage.getItem(localStorageKeys.DOCTOR_ID);
        const response = await listPrescription(
            Number(id),
            Number(total),
            Number(page),
            text,
            animal,
            searchType,
        );
        if (Object.keys(prescriptions).length === 0) {
            setPrescriptions(response);
        } else if (!resetList) {
            for (const date of Object.keys(response)) {
                let previousData: any[];
                if (Array.isArray(prescriptions[date])) {
                    previousData = prescriptions[date];
                } else {
                    previousData = [];
                }
                prescriptions[date] = [...response[date], ...previousData];
            }
            setPrescriptions(prescriptions);
        } else {
            setPrescriptions(response);
            forceUpdate();
            setClearPrescriptions(false);
        }
        setLoading(false);
    }

    function resetList(prescriptionId?: number) {
        setClearPrescriptions(true);
        setText(" ");
        setPage(1);
        if (!prescriptionId) {
            void getPrescriptions(true);
        } else {
            void getPrescriptionCompositions(prescriptionId);
        }
        onClose();
        forceUpdate();
    }

    async function getPrescriptionCompositions(id?: number) {
        setLoadingModal(true);
        const response = await showPrescriptionCompositions(
            id ?? Number(precrisptionId),
        );
        setPatientCPF(response?.person[0].cpf);
        setPerson(response?.person[0] as unknown as any);
        setPersonId(response.person[0].id);
        setPrescriptionsCompositions(response as any);
        setCompositions(response?.prescriptionCompositons);
        setLoadingModal(false);
        forceUpdate();
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setText(e.target.value);
        if (e.target.value.length === 1 || e.target.value === "") {
            setPage(1);
        }
        setClearPrescriptions(true);
        forceUpdate();
    }

    function handleChangeAnimal(e: React.ChangeEvent<HTMLInputElement>) {
        setAnimal(e.target.value);
        if (e.target.value.length === 1 || e.target.value === "") {
            setPage(1);
        }
        setClearPrescriptions(true);
        forceUpdate();
    }

    const loadMore = () => {
        setPage(page + 1);
    };

    const handleView = (id: number, assing: boolean) => {
        setPrescriptionId(id);
        setAssigned(assing);
        onOpen();
    };

    function renderPrescriptions(): any {
        const data = [];
        for (const date of Object.keys(prescriptions)) {
            data.push(
                <Box key={date}>
                    <Text
                        color="#D72A34"
                        fontSize="16px"
                        fontWeight={500}
                        mt="36px"
                        mb="24px"
                    >
                        {formatDateSimple(date)}
                    </Text>
                    {prescriptions[date].map((prescription, index) => (
                        <CardPrescriptions
                            key={index}
                            onClick={() =>
                                handleView(
                                    prescription?.id,
                                    prescription?.assigned,
                                )
                            }
                            resetList={resetList}
                            prescriptionId={prescription.id}
                            documentTypeId={prescription.documentTypeId}
                            idPrescriptionType={prescription.idPrescriptionType}
                            name={prescription?.patientName}
                            createDate={formatToDateTime(
                                new Date(prescription?.createDate),
                            )}
                            assignDate={prescription?.assignDate}
                            isSigned={prescription?.assigned}
                        />
                    ))}
                </Box>,
            );
        }
        return data;
    }

    useEffect(() => {
        void getEmail();
    }, []);

    useEffect(() => {
        void getPrescriptions();
    }, [page]);

    useEffect(() => {
        if (!isNaN(Number(precrisptionId))) {
            void getPrescriptionCompositions();
        }
    }, [precrisptionId]);
    const isAdminEmail = validAdminEmails.includes(email);
    const [isLargerThan800] = useMediaQuery("(min-width: 800px)");
    return (
        <>
            <Flex direction="column" width={{ base: "96vw", md: "100%" }}>
                <Flex
                    direction="row"
                    width={"100%"}
                    justifyContent="space-evenly"
                >
                    <motion.div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        drag={isLargerThan800 ? undefined : "x"}
                        dragConstraints={{ right: 0, left: -56 }}
                    >
                        <SquareButton
                            textAlign="left"
                            width="95%"
                            type="submit"
                            height="47px"
                            onClick={() => {
                                navigate("/prescription");
                            }}
                            cannotBeBeSquare
                            text="Nova prescrição"
                            textColor="white.100"
                            bgColor="#D72A34"
                            icon={<i className="ri-medicine-bottle-line"></i>}
                            variant={"outline"}
                            hasIcon
                            maxWidth="238px"
                            fontSize={12}
                        />

                        <SquareButton
                            bgColor="#FFFFFF"
                            textAlign="left"
                            height="47px"
                            hasIcon
                            cannotBeBeSquare
                            onClick={() => {
                                setOpenPatient(true);
                                onOpenPatientList();
                            }}
                            textColor="#202D46"
                            text={
                                Number(account.councilId) === 2
                                    ? "Proprietários"
                                    : "Meus pacientes"
                            }
                            width="90%"
                            icon={
                                <i
                                    className="ri-user-3-line"
                                    style={{ color: "#D72A34" }}
                                ></i>
                            }
                            fontSize={12}
                            border="1px solid #EDEDF3"
                            borderRadius="8px"
                            maxWidth="238px"
                        />
                        <ChooseModelType />

                        {isAdminEmail ? (
                            <SquareButton
                                type="submit"
                                textAlign="left"
                                width="90%"
                                height="47px"
                                onClick={() => navigate("/admin")}
                                text="Gerenciar Profissionais"
                                textColor="#202D46"
                                bgColor="white.10"
                                cannotBeBeSquare
                                icon={
                                    <i
                                        className="ri-user-settings-line"
                                        style={{ color: "#D72A34" }}
                                    ></i>
                                }
                                hasIcon
                                border="1px solid #EDEDF3"
                                fontSize={12}
                                maxWidth="238px"
                            />
                        ) : (
                            <SquareButton
                                bgColor="#FFFFFF"
                                textAlign="left"
                                height="47px"
                                cannotBeBeSquare
                                onClick={() => {
                                    window.open(
                                        "https://wa.me/+5511957737070?text=Olá, preciso de ajuda...",
                                    );
                                }}
                                text="Preciso de Ajuda"
                                width="90%"
                                textColor="#202D46"
                                icon={
                                    <i
                                        className="ri-whatsapp-line"
                                        style={{ color: "#D72A34" }}
                                    ></i>
                                }
                                hasIcon
                                fontSize={12}
                                border="1px solid #EDEDF3"
                                borderRadius="8px"
                                maxWidth="238px"
                            />
                        )}

                        <div style={{ width: "0vw" }}></div>
                    </motion.div>
                </Flex>
                <Flex direction={{ base: "column", md: "row" }}>
                    <Flex
                        width={"100%"}
                        mt={{ base: "16px", md: "16px" }}
                        flexDirection="row"
                        px={1}
                    >
                        <InputGroup
                            backgroundColor="white.10"
                            marginRight="5px"
                        >
                            <Input
                                height="47px"
                                placeholder={
                                    Number(account.councilId) === 2
                                        ? "Buscar por proprietário"
                                        : "Buscar por paciente"
                                }
                                value={text}
                                type="text"
                                color="#7D899D"
                                onChange={(e) => handleChange(e)}
                                id={"prescriptions"}
                                name={"prescriptions"}
                                _placeholder={{ color: "#7D899D" }}
                                onKeyPress={(e: any) => {
                                    if (e.key === "Enter") {
                                        void getPrescriptions();
                                    }
                                }}
                            />
                        </InputGroup>
                        {Number(account.councilId) === 2 ? (
                            <InputGroup backgroundColor="white.10">
                                <Input
                                    height="47px"
                                    placeholder={"por animal"}
                                    value={animal}
                                    type="text"
                                    onChange={(e) => handleChangeAnimal(e)}
                                    id={"prescriptions"}
                                    name={"prescriptions"}
                                    _placeholder={{ color: "#7D899D" }}
                                    onKeyPress={(e: any) => {
                                        if (e.key === "Enter") {
                                            void getPrescriptions();
                                        }
                                    }}
                                />
                            </InputGroup>
                        ) : null}

                        <ChakraButton
                            as={ChakraButton}
                            rightIcon={
                                <i
                                    className="ri-search-line"
                                    style={{
                                        color: "#FFFFFF",
                                        marginRight: "8px",
                                    }}
                                ></i>
                            }
                            border="1px solid #EDEDF3;"
                            boxShadow={"2px 3px 15px rgba(64, 70, 82, 0.05);"}
                            backgroundColor="#D72A34"
                            height="47px"
                            width="47px"
                            marginLeft="10px"
                            borderRadius="8px"
                            _hover={{
                                cursor: "pointer",
                                backgroundColor: "#D72A34",
                            }}
                            // eslint-disable-next-line no-void
                            onClick={() => void getPrescriptions()}
                        ></ChakraButton>
                    </Flex>
                </Flex>

                <Flex
                    flexDirection="row"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    mt={"30px"}
                >
                    <Text fontWeight="bold">Últimas prescrições</Text>
                </Flex>
                <Flex
                    flexDirection="column"
                    flexWrap="wrap"
                    justifyContent="space-between"
                >
                    {loading ? null : renderPrescriptions()}
                </Flex>
                <Center>
                    {loading ? (
                        <Flex
                            width="100%"
                            height="100%"
                            justifyContent="center"
                        >
                            <ReactLoading
                                type="spin"
                                width="35px"
                                height="35px"
                                color="#D72A34"
                            />
                        </Flex>
                    ) : Object.keys(prescriptions).length === 0 ? (
                        <Text>Nenhum documento encontrado</Text>
                    ) : (
                        <Text
                            color="red.100"
                            fontSize={14}
                            fontWeight="900"
                            onClick={loadMore}
                            _hover={{
                                cursor: "pointer",
                            }}
                        >
                            Ver mais
                        </Text>
                    )}
                </Center>
            </Flex>
            <ShowPrescriptionDetails
                assigned={assigned}
                compositions={compositions}
                isOpen={isOpen}
                loadingModal={loadingModal}
                onClose={onClose}
                onOpen={onOpen}
                person={person as IPatientDto}
                precrisptionId={Number(precrisptionId)}
                prescriptionsCompositions={
                    prescriptionsCompositions as IPrescriptionCompositionDto
                }
                setAssigned={setAssigned}
                resetList={resetList}
                patientCPF={String(patientCPF)}
                personId={Number(personId)}
                patientEmail={String(person?.email)}
                patientPhoneNumber={String(person?.phoneNumber)}
            />
            {openPatient ? (
                <SearchPatient
                    setPatient={() => {}}
                    useButton={false}
                    dontShowNothing
                    isOpenPatientList={isOpenPatientList}
                    onOpenPatientList={onOpenPatientList}
                    onClosePatientList={onClosePatientList}
                />
            ) : null}
        </>
    );
}
