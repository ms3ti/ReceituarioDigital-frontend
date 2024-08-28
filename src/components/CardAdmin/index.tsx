import { Dispatch, SetStateAction } from "react";
import {
    Text,
    Flex,
    List,
    Menu,
    MenuButton,
    MenuList,
    ListItem,
} from "@chakra-ui/react";
import { formatToCPF } from "brazilian-values";
import { DeleteAdminModal } from "../DeleteAdminModal/index";
import { Admin } from "../Admin";

interface Props {
    name: string;
    cpf: string;
    active: boolean;
    id: number;
    searchValue: string;
    findDoctor: (cpf: string) => Promise<void>;
    doctorId: number;
    setSearchWord: Dispatch<SetStateAction<string>>;
}

export function CardAdmin({
    active,
    cpf,
    name,
    id,
    findDoctor,
    searchValue,
    doctorId,
    setSearchWord,
}: Props) {
    return (
        <Flex
            padding="15px"
            width="100%"
            height="auto"
            minH="79px"
            borderRadius={4}
            border="1px solid #EDEDF3"
            my={2}
            onClick={() => {}}
            _hover={{
                cursor: "pointer",
                backgroundColor: "white.200",
            }}
        >
            <Flex direction="column" width="100%">
                <Text color="red" fontSize="11px">
                    ADMINSTRADOR
                </Text>
                <Text width="80%" fontWeight={900}>
                    {name}
                    <Text fontWeight={500} color="#3E4C62" fontSize="14px">
                        {formatToCPF(cpf)}
                    </Text>
                </Text>
            </Flex>
            <Flex direction="column" width="50px" justifyContent="center">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "47px",
                        minWidth: "47px",
                        height: "47px",
                        minHeight: "47px",
                        margin: 0,
                        padding: 0,
                        backgroundColor: "white",
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: "#EDEDF3",
                        color: "#7D899D",
                    }}
                >
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
                                        borderBottom="1px"
                                        borderBottomColor="gray.500"
                                    >
                                        <DeleteAdminModal
                                            id={id}
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
                                        <Admin
                                            personId={id}
                                            isCreation={false}
                                        />
                                    </ListItem>
                                </List>
                            </div>
                        </MenuList>
                    </Menu>
                </div>
            </Flex>
        </Flex>
    );
}
