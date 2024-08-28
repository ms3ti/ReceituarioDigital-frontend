import {
    Container,
    InputGroup,
    Text,
    Input,
    InputRightElement,
    Flex,
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    TabIndicator,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Header } from "../../components";
import BackButton from "../../components/BackButton";
import { UserToBlock } from "../../components/UserToBlock";
import { IPersonDto } from "../../interfaces/person/person.dto";
import { getPersonByCPF } from "../../services/getPersonByCPF";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { validAdminEmails } from "../../utils/validAdminEmails";
import { getAdminByCPF } from "../../services/getAdminByCPF";
import { CardAdmin } from "../../components/CardAdmin/index";
import { CreateUserModal } from "../../components/CreateUser/index";
import { Admin as CAdmin } from "../../components/Admin";

export function Admin() {
    const [email, setEmail] = useState<string>("");
    const [doctorId, setDoctorId] = useState<string>("");
    const [cpf, setCPF] = useState<string>("");
    const [personList, setPersonList] = useState<IPersonDto[]>();
    const [adminList, setAdminList] = useState<IPersonDto[]>();
    const [personType, setpersonType] = useState<number>();
    const [searchWord, setSearchWord] = useState("");
    const [personTypeForTab, setPersonTypeForTab] = useState(2);
    const isAdminEmail = validAdminEmails.includes(email) || personType === 3;
    // const [loading, setLoading] = useState(false);

    async function getEmail() {
        const email = await asyncLocalStorage.getItem(localStorageKeys.EMAIL);
        const id = await asyncLocalStorage.getItem(localStorageKeys.DOCTOR_ID);
        const personType = await asyncLocalStorage.getItem(
            localStorageKeys.PERSON_TYPE,
        );
        setpersonType(Number(personType?.replaceAll('"', "")));
        setEmail(String(email).replaceAll('"', ""));
        setDoctorId(String(id).replaceAll('"', ""));
    }

    async function findDoctor(cpf: string) {
        const result = await getPersonByCPF(cpf);
        setPersonList(result);
    }

    async function findAdmin(cpf: string) {
        const result = await getAdminByCPF(cpf);
        setAdminList(result);
    }

    useEffect(() => {
        void getEmail();
    }, []);

    useEffect(() => {
        void findDoctor(cpf);
        void findAdmin(cpf);
    }, [cpf]);

    useEffect(() => {
        if (searchWord === "searchWord") {
            setSearchWord("");
        }
        void findAdmin(searchWord);
        void findDoctor(searchWord);
    }, [searchWord]);
    return (
        <>
            {isAdminEmail ? (
                <>
                    <Header id={Number(doctorId)} />
                    <Box width={{ base: "90vw", md: "52vw" }} margin="auto">
                        <Flex flexDirection="column" alignItems="center">
                            <Flex
                                backgroundColor="#F7F8FA"
                                height="150px"
                                width="100vw"
                                justifyContent="center"
                                flexDirection="column"
                                alignItems="center"
                                pt="30px"
                            >
                                <Text marginTop="15px">
                                    {personType !== 3 ? <BackButton /> : null}
                                    <Text
                                        fontWeight={750}
                                        textAlign="left"
                                        my="15px"
                                        width={{
                                            base: "90vw",
                                            md: "1000px",
                                            lg: "1000px",
                                        }}
                                        color="#202D46"
                                    >
                                        O que deseja fazer?
                                    </Text>
                                </Text>

                                <Flex
                                    height="118px"
                                    width={{ base: "100%", md: "1000px" }}
                                    justifyContent="flex-start"
                                    flexDirection={{
                                        base: "column",
                                        md: "row",
                                    }}
                                    alignItems="center"
                                    mb="10px"
                                >
                                    <Box width="100%" flexDirection="row">
                                        <Box
                                            width="48%"
                                            height="47px"
                                            textColor="white.100"
                                            bgColor="red.100"
                                            mx={2}
                                            maxWidth="238px"
                                            fontSize={12}
                                            _hover={{
                                                backgroundColor: "red.100",
                                                cursor: "pointer",
                                            }}
                                            boxShadow="0px 3px 15px rgba(201, 21, 32, 0.2)"
                                            alignItems="center"
                                            placeContent="center"
                                            borderRadius={"0.375rem"}
                                            display="flex"
                                        >
                                            <i
                                                className="ri-user-add-line"
                                                style={{
                                                    fontWeight: 900,
                                                    fontSize: "14px",
                                                }}
                                            ></i>
                                            <Text
                                                fontWeight={900}
                                                fontSize="14px"
                                                marginLeft="10px"
                                            >
                                                <CreateUserModal
                                                    isAdminCreation
                                                    isDoctorCreation
                                                    buttonMessage="Novo Profissional"
                                                />
                                            </Text>
                                        </Box>
                                        <Box
                                            position="relative"
                                            top="-48px"
                                            left="50%"
                                        >
                                            <CAdmin isCreation />
                                        </Box>
                                    </Box>
                                    <InputGroup
                                        position="relative"
                                        top="-25px"
                                        boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
                                        border="1px solid #EDEDF3"
                                        borderRadius="8px"
                                        width={{
                                            base: "90vw",
                                            md: "52vw",
                                            lg: "1000px",
                                        }}
                                        backgroundColor="#FFFFFF"
                                    >
                                        <Input
                                            style={{ color: "#94A0B4" }}
                                            placeholder={
                                                personTypeForTab === 2
                                                    ? "Buscar profissional"
                                                    : "Buscar administrador"
                                            }
                                            value={cpf}
                                            onChange={(e: any) =>
                                                setCPF(e.target.value)
                                            }
                                            onKeyPress={(e: any) => {
                                                if (e.key === "Enter") {
                                                    void findDoctor(cpf);
                                                }
                                            }}
                                        />
                                        <InputRightElement>
                                            <i className="ri-search-line"></i>
                                        </InputRightElement>
                                    </InputGroup>
                                </Flex>
                            </Flex>
                            <Box
                                flexDirection="column"
                                maxW="1000px"
                                width={{ base: "90vw", md: "70vw" }}
                                paddingBottom="110px"
                                paddingTop="25px"
                            >
                                <Tabs
                                    position="relative"
                                    variant="red"
                                    colorScheme="green"
                                    width="100%"
                                >
                                    <TabList>
                                        <Tab
                                            _selected={{ color: "red" }}
                                            onClick={() =>
                                                setPersonTypeForTab(2)
                                            }
                                        >
                                            <Text fontSize="16px">
                                                Profissional
                                            </Text>
                                        </Tab>
                                        <Tab
                                            _selected={{ color: "red" }}
                                            onClick={() =>
                                                setPersonTypeForTab(3)
                                            }
                                        >
                                            <Text>Administradores</Text>
                                        </Tab>
                                    </TabList>
                                    <TabIndicator
                                        mt="-1.5px"
                                        height="2px"
                                        bg="red"
                                        borderRadius="1px"
                                    />
                                    <TabPanels>
                                        <TabPanel>
                                            {
                                                personList?.map((person: any) => (
                                                <UserToBlock
                                                    setSearchWord={
                                                        setSearchWord
                                                    }
                                                    plan={person?.doctor?.plan}
                                                    datePlan={
                                                        person?.doctor
                                                            ?.date_plan
                                                    }
                                                    key={Number(person.id)}
                                                    active={Boolean(
                                                        person.active,
                                                    )}
                                                    cpf={String(person.cpf)}
                                                    id={Number(person.id)}
                                                    name={String(person.name)}
                                                    doctorId={
                                                        person?.doctor?.id
                                                    }
                                                    searchValue={cpf}
                                                    findDoctor={findDoctor}
                                                />
                                            ))}
                                        </TabPanel>
                                        <TabPanel>
                                            {adminList?.map((person: any) => (
                                                <CardAdmin
                                                    key={Number(person.id)}
                                                    active={Boolean(
                                                        person.active,
                                                    )}
                                                    cpf={String(person.cpf)}
                                                    id={Number(person.id)}
                                                    name={String(person.name)}
                                                    doctorId={
                                                        person?.doctor?.id
                                                    }
                                                    searchValue={cpf}
                                                    findDoctor={findDoctor}
                                                    setSearchWord={
                                                        setSearchWord
                                                    }
                                                />
                                            ))}
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>
                            </Box>
                        </Flex>
                    </Box>
                </>
            ) : (
                <Container>
                    <Text>Você não tem acesso a está página</Text>
                </Container>
            )}
        </>
    );
}
