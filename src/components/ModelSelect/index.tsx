import {
    Checkbox,
    Flex,
    Text,
    Box,
    Menu,
    MenuButton,
    MenuList,
    Button,
    List,
    ListItem,
    Button as ChakraButton,
    MenuItem,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DeletePrescriptionModal } from "../DeletePrescriptionModal";

interface Props {
    title: string;
    id: number;
    checked: boolean;
    changeValue: any;
    updateList: () => Promise<void>;
    saveRawPrescription: () => Promise<void>;
    isEditPrescription?: boolean;
    documentId: number;
    isFromMainPage?: boolean;
    show?: boolean;
}

export default function ModelSelect({
    id,
    title,
    checked,
    changeValue,
    updateList,
    saveRawPrescription,
    isEditPrescription,
    documentId,
    isFromMainPage = false,
    show = true,
}: Props) {
    const navigate = useNavigate();
    function redirectToEdit() {
        void saveRawPrescription();
        navigate(
            `/editPrescriptionModel/${id}?edit=${isEditPrescription}&docId=${documentId}&isFromMainPage=${String(
                isFromMainPage,
            )}`,
        );
    }
    return (
        <Box
            backgroundColor="#FFFFFF"
            boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
            borderRadius="8px"
            border="red.100"
            width="100%"
            height="8vh"
            py="10px"
            my="5px"
        >
            <Flex
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center"
            >
                {show ? (
                    <Checkbox
                        id="model"
                        ml="20px"
                        colorScheme="red"
                        isChecked={checked}
                        onChange={changeValue}
                    />
                ) : null}

                <Box width="80%" maxHeight="64px" ml={{ base: "8px" }}>
                    <Text fontWeight={900} color="#202D46">
                        {title}
                    </Text>
                </Box>

                <Box
                    alignSelf="center"
                    _hover={{
                        background: "white",
                    }}
                    _active={{
                        background: "white",
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
                            as={Button}
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
                                            background: "white",
                                        }}
                                        _active={{
                                            background: "white",
                                        }}
                                        borderBottom="1px"
                                        borderBottomColor="gray.500"
                                    >
                                        <DeletePrescriptionModal
                                            prescriptionId={id}
                                            updateList={updateList}
                                            isDefault={checked}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ChakraButton
                                            height="max-content"
                                            margin={0}
                                            padding={0}
                                            width="100%"
                                        >
                                            <MenuItem
                                                onClick={redirectToEdit}
                                                width="100%"
                                                _hover={{
                                                    background: "gray.500",
                                                }}
                                                _active={{
                                                    background: "gray.500",
                                                }}
                                                _focus={{
                                                    background: "gray.500",
                                                }}
                                            >
                                                <i
                                                    className="ri-edit-line"
                                                    style={{ color: "#7D899D" }}
                                                ></i>
                                                <Text ml="4px">
                                                    Visualizar / Editar
                                                </Text>
                                            </MenuItem>
                                        </ChakraButton>
                                    </ListItem>
                                </List>
                            </div>
                        </MenuList>
                    </Menu>
                </Box>
            </Flex>
        </Box>
    );
}
