import {
    Flex,
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
import { useEffect, useReducer, useState } from "react";
import ReactLoading from "react-loading";
import { IAddressOwnerAddressDto } from "../../interfaces/address/address.ownerAddress.dto";
import { IAddressOwnerAddressPayloadDto } from "../../interfaces/address/address.ownerAddress.payload.dto";
import { ICreateAddressPayloadDto } from "../../interfaces/address/create.address.payload.dto";
import { ICreatedAddressDto } from "../../interfaces/address/created.address.dto";
import { createAddress } from "../../services/createAddress";
import { getDoctorByEmail } from "../../services/getDoctorByEmail";
import { listAddressByPersonId } from "../../services/listAddressByPersonId";
import { saveImage } from "../../services/saveImage";
import { setAddressToDefault } from "../../services/setAddressToDefault";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { AddAddress } from "../AddAddress";
import { AddressSelect } from "../AddressSelect";

export function ListAddress() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);

    const [address, setAddress] = useState<IAddressOwnerAddressPayloadDto[]>(
        [],
    );
    const [displayAddress, setDisplayAddress] =
        useState<IAddressOwnerAddressDto>();

    async function getInfo() {
        const personId = await asyncLocalStorage.getItem(
            localStorageKeys.PERSON_ID,
        );
        const result = await listAddressByPersonId(
            Number(personId?.replaceAll('"', "")),
        );
        setAddress(result);
    }

    async function postSetAddressToDefault(ownerAddressId: number) {
        setLoading(true);
        await setAddressToDefault(ownerAddressId);
        await getDisplayAddress();
        await getInfo();
        setLoading(false);
        onClose();
    }

    async function updateList() {
        setLoading(true);
        await getDisplayAddress();
        await getInfo();
        setLoading(false);
        forceUpdate();
    }

    async function getDisplayAddress() {
        const email = await asyncLocalStorage.getItem(localStorageKeys.EMAIL);
        const doctor = await getDoctorByEmail(JSON.parse(String(email)));
        await asyncLocalStorage.setItem(
            localStorageKeys.ADDRESS,
            JSON.stringify(doctor.address),
        );
        const result = await asyncLocalStorage.getItem(
            localStorageKeys.ADDRESS,
        );
        setDisplayAddress(JSON.parse(String(result)));
    }

    async function addAddress(
        values: ICreateAddressPayloadDto,
        image: any,
    ): Promise<ICreatedAddressDto> {
        const result = await createAddress(values);
        if (image.length > 0) {
            const doctorId = Number(
                await asyncLocalStorage.getItem(localStorageKeys.DOCTOR_ID),
            );
            await saveImage(result.ownerAddressId, doctorId, {
                data_url: image[0]?.data_url,
            });
        }
        await getInfo();
        return result;
    }

    useEffect(() => {
        void getDisplayAddress();
        setLoading(true);
        void getInfo();
        setLoading(false);
    }, []);

    return (
        <>
            <Flex
                boxShadow="inset 0px -1px 0px #EDEDF3"
                backgroundColor="#FFFFFF"
                flexDirection="row"
                justifyContent="center"
                paddingTop="11px"
                paddingBottom="11px"
                onClick={onOpen}
                _hover={{
                    cursor: "pointer",
                }}
            >
                <Text marginRight="10px">{displayAddress?.ownerName}</Text>
                <i
                    className="ri-arrow-down-s-line"
                    style={{
                        color: "#D72A34",
                        fontWeight: 800,
                    }}
                ></i>
            </Flex>

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "xl", lg: "lg", xl: "2xl" }}
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Endereço de atendimento
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text color="gray.200" fontWeight={400}>
                            O endereço de atendimento selecionado será utilizado
                            nos documentos emitidos
                        </Text>

                        <Flex
                            flexDirection="row"
                            flexWrap="wrap"
                            paddingTop="15px"
                            maxHeight="100%"
                            height="100%"
                            marginTop="15px"
                        >
                            {address.length > 0 ? (
                                address.map(
                                    (
                                        option: IAddressOwnerAddressPayloadDto,
                                        index: number,
                                    ) => (
                                        <AddressSelect
                                            updateList={updateList}
                                            key={index}
                                            postSetAddressToDefault={
                                                postSetAddressToDefault
                                            }
                                            address={option}
                                        />
                                    ),
                                )
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
                                        <Text>Nenhum local encontrado</Text>
                                    )}
                                </Flex>
                            )}
                        </Flex>
                    </ModalBody>

                    <ModalFooter
                        width="100%"
                        backgroundColor="#FFFFFF"
                        zIndex={2}
                        borderTop="1px solid #EDEDF3"
                    >
                        <AddAddress addAddress={addAddress} />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
