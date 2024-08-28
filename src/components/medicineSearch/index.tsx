import {
    Box,
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
import { useEffect, useState } from "react";
import { IMedicineDto } from "../../interfaces/prescription/medicine.dto";
import { getMedicineById } from "../../services/getMedicineById";
import { listMedicine } from "../../services/listMedicine";
import { Button } from "../Button";
import { InputIcon } from "../InputIcon";
import { MedicineItem } from "../medicineItem";

interface Props {
    index: number;
    medicineIdValue: number | null;
    setFieldValue: any;
}

export function MedicineSearch({
    index,
    medicineIdValue,
    setFieldValue,
}: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [itemSelected, setSelectedItem] = useState<IMedicineDto>();
    const [clickedItem, setClickedItem] = useState<IMedicineDto>();
    const [examName, setExamName] = useState("");
    const [items, setItems] = useState<IMedicineDto[]>([]);

    async function getExamsForEdit() {
        if (medicineIdValue) {
            const result = await getMedicineById(medicineIdValue);
            setSelectedItem(result);
        }
    }

    async function getInfo() {
        const result = await listMedicine(examName);
        setItems(result);
    }

    function selectItem(e: any) {
        const itemSelect = items.find(
            (item) => item.id === Number(e.target.value),
        );
        setClickedItem(itemSelect);
    }

    function confirmItem() {
        setFieldValue(`[${index}].medicineId`, Number(clickedItem?.id));
        setSelectedItem(clickedItem);
        onClose();
    }

    useEffect(() => {
        void getExamsForEdit();
        void getInfo();
    }, [examName]);

    useEffect(() => {
        void getExamsForEdit();
    }, [medicineIdValue]);

    return (
        <>
            <Box
                backgroundColor="#F7F8FA"
                width={{ base: "100%", md: "967px" }}
                marginTop="15px"
                marginBottom="15px"
                marginLeft="5px"
            >
                <Flex
                    _hover={{
                        cursor: "pointer",
                    }}
                    onClick={onOpen}
                    backgroundColor="white.500"
                    border="1px solid #EDEDF3;"
                    borderRadius="8px"
                    padding="12px 16px"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    {itemSelected ? (
                        <Flex direction="column">
                            <Flex>
                                <Text fontWeight={900} fontSize={14}>
                                    {itemSelected.substance.length
                                        ? `${itemSelected.substance}, ${itemSelected.product}`
                                        : `${itemSelected.product}`}
                                </Text>
                            </Flex>
                            <Text fontWeight={400} fontSize={12}>
                                {itemSelected.presentation}
                            </Text>
                        </Flex>
                    ) : (
                        "Selecione um medicamento"
                    )}

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
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Buscar por remédio
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <InputIcon
                            icon={<i className="ri-search-line"></i>}
                            placeholder={"Digite o nome do remédio"}
                            value={examName}
                            onChange={(e: any) => setExamName(e.target.value)}
                            isPassword={false}
                            onKeyPress={(e: any) => {
                                if (e.key === "Enter") {
                                    void getExamsForEdit();
                                    void getInfo();
                                }
                            }}
                        />
                        <Box maxHeight="70vh">
                            {items.length > 0 ? (
                                items.map((item: IMedicineDto) => (
                                    <MedicineItem
                                        key={item.id}
                                        checked={item.id === clickedItem?.id}
                                        changeValue={selectItem}
                                        value={item}
                                    />
                                ))
                            ) : (
                                <Text
                                    textAlign="center"
                                    marginTop="20px"
                                    marginBottom="20px"
                                >
                                    Nenhum medicamento encontrado
                                </Text>
                            )}
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
