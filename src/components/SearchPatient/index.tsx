import {
    Box,
    Center,
    Flex,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useReducer, useState } from "react";
import ReactLoading from "react-loading";
import { useAccount } from "../../contexts/accountContext";
import { IListPatient } from "../../interfaces/patient/create.patient.dto";
import { listPatient } from "../../services/listPatient";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { Button } from "../Button";
import { CreateUserModal } from "../CreateUser";
import PatientSelect from "../PatientSelect";

interface Props {
    setPatient: React.Dispatch<React.SetStateAction<undefined | IListPatient>>;
    useButton: boolean;
    dontShowNothing?: boolean;
    isOpenPatientList?: boolean;
    onOpenPatientList?: () => void;
    onClosePatientList?: () => void;
}

export function SearchPatient({
    setPatient,
    useButton,
    dontShowNothing,
    isOpenPatientList,
    onClosePatientList,
    onOpenPatientList,
}: Props) {
    const account = useAccount();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [patients, setPatients] = useState<any[] | IListPatient[]>([]);
    const [checked, setChecked] = useState<boolean[]>([]);
    const [buttonIsDisable, setButtonIsDisable] = useState(false);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [searchWord, setSearchWord] = useState("");
    const [id, setId] = useState<number>();
    const [loading, setLoading] = useState<boolean>(false);

    function changeValue(index: number): void {
        const initialValue = checked[index];
        checked.fill(false);
        checked[index] = !initialValue;
        setChecked(checked);
        const buttonIsDisable = checked.every((value) => !value);
        setButtonIsDisable(!buttonIsDisable);
        forceUpdate();
    }

    function closeModel() {
        if (setPatient !== null) {
            setSearchWord("");
            onClose();
        }
    }
    function handleSubmit() {
        const checkboxSelectedIndex = checked.indexOf(true);
        const selectedPatient: IListPatient = patients[checkboxSelectedIndex];
        setPatient(selectedPatient);
        onClose();
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchWord(e.target.value);
    }

    async function findPatient(query: string) {
        setLoading(true);
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        setId(Number(docId));
        const result = await listPatient(Number(docId), query);
        setChecked(Array(result.length).fill(false));
        setPatients(result);
        setLoading(false);
        forceUpdate();
    }

    useEffect(() => {
        if (searchWord === "searchWord") {
            setSearchWord("");
        }
        void findPatient(searchWord);
    }, [searchWord, account.isChange]);

    return (
        <>
            {useButton ? (
                <Center w={{ base: "100%", md: "100%" }}>
                    <Flex
                        w={{ base: "80%", md: "337px" }}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Button
                            onClick={onOpen}
                            text={`Identificar ${
                                Number(account.councilId) === 2
                                    ? "proprietário"
                                    : "paciente"
                            }`}
                            icon={<i className="ri-user-search-line"></i>}
                            textColor="red.100"
                            bgColor="white.0"
                            border="1px solid rgba(215, 42, 52, 0.2)"
                            hasIcon={false}
                            width="100%"
                            height={47}
                            fontSize={14}
                        />
                    </Flex>
                </Center>
            ) : (
                <>
                    {dontShowNothing ? null : (
                        <Text
                            onClick={onOpen}
                            color="gray.200"
                            marginTop="15px"
                            marginBottom="5px"
                            _hover={{
                                cursor: "pointer",
                            }}
                            textDecoration="underline"
                        >
                            Substituir
                            {Number(account.councilId) === 2
                                ? " proprietário"
                                : " paciente"}
                        </Text>
                    )}
                </>
            )}

            <Modal
                isOpen={
                    dontShowNothing ? (isOpenPatientList as boolean) : isOpen
                }
                onClose={
                    dontShowNothing
                        ? (onClosePatientList as () => void)
                        : closeModel
                }
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent minH="200px" backgroundColor="white">
                    <ModalHeader borderBottom="1px solid #EDEDF3">
                        Identifique o{" "}
                        {Number(account.councilId) === 2
                            ? "proprietário"
                            : "paciente"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex
                            flexDirection="row"
                            flexWrap="nowrap"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Input
                                border="1px solid"
                                borderColor="gray.100"
                                placeholder="Busque por CPF ou Nome"
                                w={{ base: "85%", md: "90%" }}
                                color="gray.100"
                                marginRight="10px"
                                _placeholder={{
                                    color: "#94A0B4",
                                }}
                                onChange={(e) => handleChange(e)}
                                onKeyPress={(e: any) => {
                                    if (e.key === "Enter") {
                                        void findPatient(searchWord);
                                    }
                                }}
                            />
                            <Flex
                                w="40px"
                                h="40px"
                                border="1px solid #94A0B4"
                                borderRadius="8px"
                                boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
                                backgroundColor="white.0"
                                flexDirection="row"
                                flexWrap="wrap"
                                margin={0}
                                justifyContent="space-around"
                            >
                                <CreateUserModal
                                    isDoctorCreation={false}
                                    setPatient={setPatient}
                                    closeListModal={closeModel}
                                    doctorId={Number(id)}
                                    findPatient={findPatient}
                                    buttonMessage={
                                        <i
                                            className="ri-user-add-line"
                                            style={{
                                                color: "#94A0B4",
                                                fontSize: "25px",
                                            }}
                                        ></i>
                                    }
                                />
                            </Flex>
                        </Flex>
                        <Flex
                            flexDirection="row"
                            flexWrap="wrap"
                            paddingTop="15px"
                            maxHeight="72vh"
                            marginTop="15px"
                        >
                            {patients.length > 0 ? (
                                patients.map((patient: IListPatient, index) => (
                                    <PatientSelect
                                        patient={patient}
                                        key={index}
                                        checked={checked[index]}
                                        changeValue={() => changeValue(index)}
                                        setSearchWord={setSearchWord}
                                        showCheckbox={!!dontShowNothing}
                                    />
                                ))
                            ) : (
                                <Flex
                                    width="100%"
                                    height="100%"
                                    justifyContent="center"
                                >
                                    {loading ? (
                                        <ReactLoading
                                            type="bubbles"
                                            color="#D72A34"
                                        />
                                    ) : (
                                        <Text>
                                            Nenhum{" "}
                                            {Number(account.councilId) === 2
                                                ? "proprietário"
                                                : "paciente"}{" "}
                                            encontrado
                                        </Text>
                                    )}
                                </Flex>
                            )}
                        </Flex>
                    </ModalBody>
                    <ModalFooter minHeight="80px" borderTop="1px solid #EDEDF3">
                        <Box width={{ base: "100%", md: "100%" }}>
                            <Button
                                bgColor="red.100"
                                text="Continuar"
                                fontSize={14}
                                width="100%"
                                height={"47px"}
                                textColor="white.100"
                                type="submit"
                                onClick={
                                    dontShowNothing
                                        ? (onClosePatientList as () => void)
                                        : handleSubmit
                                }
                                disable={!buttonIsDisable}
                                hasIcon={false}
                            />
                        </Box>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
