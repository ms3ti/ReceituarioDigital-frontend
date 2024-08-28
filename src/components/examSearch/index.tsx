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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IMedicalExamDto } from "../../interfaces/prescription/medical.exam.dto";
import { ICreatePrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";
import { IPrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/prescriptionComposition.dto";
import { getExamById } from "../../services/getExamById";
import { listMedicalExam } from "../../services/listMedicalExam";
import { capitalizeFirstLetter } from "../../utils/capilatilize";
import { BoxTitle } from "../BoxTitle";
import { Button } from "../Button";
import { Item } from "../Item";

interface Props {
    setExamList: Dispatch<SetStateAction<ICreatePrescriptionCompositionDto[]>>;
    removeItem: (index: number) => void;
    examList: ICreatePrescriptionCompositionDto[];
    index: number;
    exam: ICreatePrescriptionCompositionDto | IPrescriptionCompositionDto;
}

export function ExamSearch({
    setExamList,
    removeItem,
    index,
    examList,
    exam,
}: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [itemSelected, setSelectedItem] = useState<IMedicalExamDto>();
    const [clickedItem, setClickedItem] = useState<IMedicalExamDto>();

    const [examName, setExamName] = useState("");
    const [items, setItems] = useState<IMedicalExamDto[]>([]);
    const showRemoveButton = index !== 0;

    async function getExamsForEdit() {
        if (Object.keys(exam).length > 0) {
            const result = await getExamById(exam.examId);
            setSelectedItem(result);
        }
    }

    async function getInfo() {
        const result = await listMedicalExam(examName);
        setItems(result);
    }

    function selectItem(e: any) {
        const itemSelect = items.find(
            (item) => item.id === Number(e.target.value),
        );
        setClickedItem(itemSelect);
    }

    function confirmItem() {
        setSelectedItem(clickedItem);
        const aux = examList;
        aux[index] = {
            ...exam,
            examId: Number(clickedItem?.id),
        };
        setExamList(aux);
        onClose();
    }

    useEffect(() => {
        void getExamsForEdit();
        void getInfo();
    }, [examName]);

    useEffect(() => {
        void getExamsForEdit();
    }, [exam]);

    return (
        <>
            <Box
                backgroundColor="#F7F8FA"
                padding="15px"
                width={{ base: "100%", md: "1000px" }}
                marginBottom="10px"
                borderRadius="4px"
                boxShadow="md"
            >
                <Flex placeContent="space-between">
                    <BoxTitle text="Exame" />
                    {showRemoveButton ? (
                        <Text
                            fontWeight={800}
                            color="#7D899D"
                            fontSize="12px"
                            textDecorationLine="underline"
                            _hover={{
                                cursor: "pointer",
                            }}
                            paddingRight="10px"
                            onClick={() => removeItem(index)}
                        >
                            Remover
                        </Text>
                    ) : null}
                </Flex>
                <Flex
                    _hover={{
                        cursor: "pointer",
                    }}
                    onClick={onOpen}
                    backgroundColor="white.500"
                    border="1px solid #EDEDF3;"
                    borderRadius="8px"
                    padding="8px 16px"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Text>
                        {itemSelected
                            ? capitalizeFirstLetter(itemSelected.name)
                            : "Selecione um exame"}
                    </Text>
                    {itemSelected ? (
                        <i
                            className="ri-pencil-line"
                            style={{
                                color: "#94A0B4",
                                fontSize: "25px",
                                alignSelf: "flex-end",
                            }}
                        ></i>
                    ) : (
                        <i
                            className="ri-arrow-drop-right-line"
                            style={{
                                color: "#94A0B4",
                                fontSize: "25px",
                                alignSelf: "flex-end",
                            }}
                        ></i>
                    )}
                </Flex>
            </Box>

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "xl", lg: "lg", xl: "2xl" }}
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Buscar por exame
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <InputGroup>
                            <Input
                                style={{ color: "gray.100" }}
                                placeholder={"Digite o nome do exame"}
                                value={examName}
                                onChange={(e: any) =>
                                    setExamName(e.target.value)
                                }
                                onKeyPress={(e: any) => {
                                    if (e.key === "Enter") {
                                        void getExamsForEdit();
                                        void getInfo();
                                    }
                                }}
                            />
                            <InputRightElement>
                                <i className="ri-search-line"></i>
                            </InputRightElement>
                        </InputGroup>
                        <Box overflowY="scroll" maxHeight="70vh">
                            {items.map((item: IMedicalExamDto) => (
                                <Item
                                    key={item.id}
                                    checked={item.id === clickedItem?.id}
                                    changeValue={selectItem}
                                    title={item.name}
                                    value={item}
                                />
                            ))}
                        </Box>
                    </ModalBody>

                    <ModalFooter
                        boxShadow="inset 0px 1px 0px #EDEDF3"
                        backgroundColor="#FFFFFF"
                    >
                        <Button
                            bgColor="#D72A34"
                            textColor="#FFFFFF"
                            fontSize={14}
                            hasIcon={false}
                            text="Continuar"
                            type="submit"
                            onClick={confirmItem}
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
