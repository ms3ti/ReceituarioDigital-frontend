/* eslint-disable no-void */
import {
    Box,
    Button,
    Checkbox,
    Flex,
    List,
    ListItem,
    Menu,
    MenuButton,
    MenuList,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { IAddressOwnerAddressPayloadDto } from "../../interfaces/address/address.ownerAddress.payload.dto";
import { DeleteAddressModal } from "../DeleteAddressModal";
import { EditAddress } from "../EditAddress";

interface Props {
    address: IAddressOwnerAddressPayloadDto;
    postSetAddressToDefault: (ownerAddressId: number) => Promise<void>;
    updateList: () => Promise<void>;
}

export function AddressSelect({
    address,
    postSetAddressToDefault,
    updateList,
}: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box
            backgroundColor="#FFFFFF"
            boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
            borderRadius="8px"
            width="100%"
            paddingTop="10px"
            paddingBottom="10px"
            marginTop="5px"
            marginBottom="5px"
        >
            <Flex
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="space-evenly"
            >
                <Checkbox
                    colorScheme="red"
                    size="lg"
                    isChecked={address.isDefault}
                    checked={address.isDefault}
                    onChange={() =>
                        void postSetAddressToDefault(address.ownerAddressId)
                    }
                />
                <Box
                    width="55%"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    <Text fontWeight={900} color="#202D46">
                        {address.ownerName}
                    </Text>
                    <Text
                        fontWeight={400}
                        color="#3E4C62"
                        textOverflow="ellipsis"
                    >{`${address.street}, ${address.number} ${address.district} - ${address.state}`}</Text>
                </Box>
                <Box alignSelf="center">
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
                                        <DeleteAddressModal
                                            ownerAddressId={
                                                address.ownerAddressId
                                            }
                                            updateList={updateList}
                                            isDefault={address.isDefault}
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
                                        <EditAddress
                                            isOpen={isOpen}
                                            onOpen={onOpen}
                                            onClose={onClose}
                                            address={address}
                                            updateList={updateList}
                                        />
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
