import {
    Box,
    Flex,
    Input,
    InputGroup,
    InputRightElement,
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
import React, { useEffect, useState, useReducer } from "react";
import ReactLoading from "react-loading";
import ModelSelect from "../ModelSelect";
import { IPrescriptionModel } from "../../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { listPrescriptionModel } from "../../services/listPrescriptionsModel";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { Button } from "../Button";
import { useNavigate } from "react-router-dom";

interface Props {
    documentTypeId: number;
    saveRawPrescription: () => Promise<void>;
    setModelToPrescription: (
        prescriptionModel: IPrescriptionModel,
    ) => Promise<void>;
    isEditPrescription?: boolean;
    documentId?: number;
    useButton?: boolean;
    openAutomatically?: boolean;
    closeList?: () => void;
    openList?: () => void;
    isFromMainPage?: boolean;
    show: boolean;
}

export function ListPrescriptionModel({
    documentTypeId,
    saveRawPrescription,
    setModelToPrescription,
    isEditPrescription,
    documentId,
    useButton = true,
    openAutomatically,
    closeList,
    openList,
    isFromMainPage = false,
    show = false,
}: Props) {
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [searchWord, setSearchWord] = useState("");
    const [checked, setChecked] = useState<boolean[]>([]);
    const [buttonIsDisable, setButtonIsDisable] = useState(false);
    const [selectedModel, setSelectedModel] = useState<IPrescriptionModel>();

    function changeValue(index: number): void {
        const initialValue = checked[index];
        checked.fill(false);
        checked[index] = !initialValue;
        setChecked(checked);
        const buttonIsDisable = checked.every((value) => !value);
        setButtonIsDisable(!buttonIsDisable);
        forceUpdate();
        setSelectedModel(prescriptionModel[index]);
    }

    function closeModal() {
        void setModelToPrescription(selectedModel as IPrescriptionModel);
        onClose();
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchWord(e.target.value);
    }

    const [prescriptionModel, setPrescriptionModel] = useState<
        IPrescriptionModel[]
    >([]);

    async function updateList() {
        setLoading(true);
        await getPrescriptions("");
        setLoading(false);
        forceUpdate();
    }

    function redirectToCreateModel() {
        navigate(`/createPrescriptionModel?documentTypeId=${documentTypeId}`);
    }

    async function getPrescriptions(query: string) {
        setLoading(true);

        const doctorId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        const result = await listPrescriptionModel(
            Number(doctorId),
            documentTypeId,
            query,
        );
        setPrescriptionModel(result);
        setLoading(false);
    }

    useEffect(() => {
        void getPrescriptions(searchWord);
    }, [searchWord, openAutomatically]);

    return (
        <>
            {useButton ? (
                <Button
                    width="160px"
                    fontSize={14}
                    text="Modelos"
                    textColor="black"
                    variant="solid"
                    type="button"
                    bgColor="white.10"
                    hasIcon={true}
                    icon={
                        <i
                            className="ri-health-book-line"
                            style={{
                                color: "red",
                            }}
                        ></i>
                    }
                    border="1px solid #EDEDF3;"
                    fontWeight={500}
                    onClick={() => {
                        void getPrescriptions("");
                        onOpen();
                    }}
                />
            ) : null}

            <Modal
                isOpen={useButton ? isOpen : !!openAutomatically}
                onClose={() => {
                    setSearchWord("");
                    if (useButton) {
                        onClose();
                    } else if (typeof closeList === "function") {
                        closeList();
                    }
                }}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
                scrollBehavior="inside"
                isCentered
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Selecione um modelo
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex flexDirection="column">
                            <Flex>
                                <InputGroup>
                                    <Input
                                        border="1px solid"
                                        borderColor="gray.500"
                                        placeholder="Busque por modelo"
                                        w="100%"
                                        color="gray.100"
                                        marginRight="10px"
                                        _placeholder={{
                                            color: "#94A0B4",
                                        }}
                                        onChange={(e) => handleChange(e)}
                                        onKeyPress={(e: any) => {
                                            if (e.key === "Enter") {
                                                void getPrescriptions(
                                                    searchWord,
                                                );
                                            }
                                        }}
                                    />
                                    <InputRightElement
                                        color="gray.100"
                                        mr="13px"
                                    >
                                        <i className="ri-search-line"></i>
                                    </InputRightElement>
                                </InputGroup>
                                {!useButton ? (
                                    <Button
                                        onClick={redirectToCreateModel}
                                        text=""
                                        textColor="red.100"
                                        bgColor="white.0"
                                        paddingLeft="25px"
                                        icon={
                                            <i
                                                className="ri-add-line"
                                                style={{
                                                    color: "#94A0B4",
                                                    fontWeight: 800,
                                                }}
                                            ></i>
                                        }
                                        border="1px solid #EDEDF3"
                                        hasIcon
                                        borderRadius="8px"
                                        width="41px"
                                        height="41px"
                                        fontSize={0}
                                    />
                                ) : null}
                            </Flex>
                            <Flex
                                flexDirection="row"
                                flexWrap="wrap"
                                paddingTop="15px"
                                maxHeight="100%"
                                height="100%"
                                marginTop="15px"
                            >
                                {prescriptionModel.length > 0 ? (
                                    loading ? (
                                        <Flex
                                            width="100%"
                                            height="100%"
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <ReactLoading
                                                width="35px"
                                                height="35px"
                                                type="spin"
                                                color="#D72A34"
                                            />
                                        </Flex>
                                    ) : (
                                        prescriptionModel.map(
                                            (model, index) => (
                                                <ModelSelect
                                                    show={show}
                                                    saveRawPrescription={
                                                        saveRawPrescription
                                                    }
                                                    updateList={updateList}
                                                    title={model.title}
                                                    id={model.id}
                                                    key={index}
                                                    checked={checked[index]}
                                                    changeValue={() =>
                                                        changeValue(index)
                                                    }
                                                    isEditPrescription={
                                                        isEditPrescription
                                                    }
                                                    documentId={Number(
                                                        documentId,
                                                    )}
                                                    isFromMainPage={
                                                        isFromMainPage
                                                    }
                                                />
                                            ),
                                        )
                                    )
                                ) : (
                                    <Flex
                                        width="100%"
                                        height="100%"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        {loading ? (
                                            <ReactLoading
                                                width="35px"
                                                height="35px"
                                                type="spin"
                                                color="#D72A34"
                                            />
                                        ) : (
                                            <Text>
                                                Nenhum modelo encontrado
                                            </Text>
                                        )}
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>
                    </ModalBody>

                    <ModalFooter
                        width="100%"
                        backgroundColor="#FFFFFF"
                        zIndex={2}
                        borderTop="1px solid #EDEDF3"
                    >
                        <Box width={{ base: "100%", md: "127px" }}>
                            <Button
                                disable={!buttonIsDisable}
                                width={"100%"}
                                height={"47px"}
                                variant="solid"
                                hasIcon={false}
                                bgColor="red.100"
                                text="Continuar"
                                textColor="#FFFFFF"
                                type="submit"
                                fontSize={14}
                                onClick={() => {
                                    if (useButton) {
                                        closeModal();
                                    } else if (
                                        typeof closeList === "function"
                                    ) {
                                        closeList();
                                    }
                                }}
                            />
                        </Box>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
