import {
    Checkbox,
    Flex,
    Text,
    Box,
    List,
    Menu,
    MenuButton,
    MenuList,
    ListItem,
} from "@chakra-ui/react";
import { formatToCPF } from "brazilian-values";
import { Dispatch, SetStateAction } from "react";
import { IListPatient } from "../../interfaces/patient/create.patient.dto";
import { DeletePatientModal } from "../DeletePatientModal";
import EditPatient from "../EditPatient";
import { useNavigate } from "react-router-dom";

interface Props {
    patient: IListPatient;
    checked: boolean;
    changeValue: any;
    setSearchWord: Dispatch<SetStateAction<string>>;
    showCheckbox: boolean;
}

export default function PatientSelect({
    patient,
    checked,
    changeValue,
    setSearchWord,
    showCheckbox,
}: Props) {
    const navigate = useNavigate();

    function creaNewDocument() {
        navigate(`/prescription?patientId=${patient.patientId}`)
    }
    return (
        <Flex
            mb={4}
            h="8vh"
            w="100%"
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            paddingLeft={showCheckbox ? "15px" : undefined}
        >
            {!showCheckbox ? (
                <Checkbox
                    id="patient"
                    alignItems="center"
                    justifyContent="center"
                    w="20%"
                    colorScheme="red"
                    isChecked={checked}
                    onChange={changeValue}
                ></Checkbox>
            ) : null}
            <Box w="100%">
                <Text fontWeight={900} color="#202D46">
                    {patient.name}
                </Text>
                <Text color="#3E4C62">{formatToCPF(patient.cpf)}</Text>
            </Box>
            <Menu>
                <MenuButton
                    backgroundColor="transparent"
                    _hover={{
                        background: "white",
                    }}
                    _active={{
                        background: "white",
                    }}
                >
                    <i className="ri-more-fill"></i>
                </MenuButton>
                <MenuList
                    border="none"
                    zIndex={9}
                    minW="0"
                    w="180px"
                    borderRadius="12px"
                    boxShadow="0px 3px 15px rgba(7, 106, 235, 0.1)"
                >
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            flexDirection: "column",
                            width: "100%",
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        <List>
                            <ListItem
                                _hover={{
                                    background: "gray.500",
                                }}
                                _active={{
                                    background: "gray.500",
                                }}
                            >
                                <DeletePatientModal
                                    id={patient.patientId}
                                    setSearchWord={setSearchWord}
                                />
                            </ListItem>
                            <ListItem
                                _hover={{
                                    background: "white",
                                }}
                                _active={{
                                    background: "white",
                                }}
                            >
                                <EditPatient
                                    isMenuList={true}
                                    patient={patient}
                                    setPatient={() => {}}
                                />
                            </ListItem>
                            <ListItem
                                cursor="pointer"
                                margin={0}
                                _hover={{
                                    backgroundColor: "#EDEDF3",
                                    h: "100%",
                                }}
                                _active={{
                                    background: "gray.500",
                                }}
                                _focus={{
                                    background: "gray.500",
                                }}
                                h="100%"
                                paddingLeft="10px"
                                onClick={creaNewDocument}
                            >
                                <Flex
                                    alignItems="center"
                                    justifyContent="start"
                                    flexDirection="row"
                                >
                                    <i
                                        className="ri-add-line"
                                        style={{
                                            color: "#7D899D",
                                            marginRight: "7px",
                                            marginBottom: "2px",
                                        }}
                                    ></i>
                                    <Text>Novo documento</Text>
                                </Flex>
                            </ListItem>
                        </List>
                    </div>
                </MenuList>
            </Menu>
        </Flex>
    );
}
