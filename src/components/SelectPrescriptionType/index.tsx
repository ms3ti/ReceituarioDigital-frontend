import {
    Box,
    Checkbox,
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
import { isCPF } from "brazilian-values";
import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useReducer,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IListPatient } from "../../interfaces/patient/create.patient.dto";
import {
    IPatientAddressDto,
    IPatientDto,
} from "../../interfaces/patient/patient.dto";
import { ICreatePrescriptionDto } from "../../interfaces/prescription/create.prescription.dto";
import { ICreatePrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";
import { createPrescription } from "../../services/createPrescription";
import { getDocStatus } from "../../services/getDocStatus";
import { getPatientById } from "../../services/getPatientById";
import { patchPatient } from "../../services/patchPatient";
import { receitaCpfApi } from "../../services/receitaCpfApi";
import { signDocument } from "../../services/signDocument";
import { updateSignDocument } from "../../services/updateSignDocument";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { PrescriptionTypeEnum } from "../../utils/enum/prescription.type.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { verifyIsEmpty } from "../../utils/verifyIsText";
import { AddCPF } from "../AddCPF";
import { Button } from "../Button";
import { ToastMessage } from "../ToastMessage";

interface Props {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    text: string;
    setEnableModal: Dispatch<SetStateAction<boolean>>;
    setPrescriptionId: Dispatch<SetStateAction<number | undefined>>;
    patient: IListPatient;
    doctorId: number | undefined;
    payload: ICreatePrescriptionCompositionDto[] | undefined;
    onOpenCreatedModal: () => void;
    documentTypeId: number;
    signed: boolean;
    setLink: React.Dispatch<React.SetStateAction<string>>;
    showDateOnPDF: boolean;
    setIsEnableWithoutSign?: Dispatch<SetStateAction<boolean>>;
    setIsEnable?: Dispatch<SetStateAction<boolean>>;
    setPatient?: Dispatch<SetStateAction<IListPatient | undefined>>;
}

export function SelectPrescriptionType({
    isOpen,
    onClose,
    onOpen,
    text,
    doctorId,
    patient,
    setEnableModal,
    setPrescriptionId,
    payload,
    onOpenCreatedModal,
    documentTypeId,
    signed,
    showDateOnPDF,
    setLink,
    setIsEnableWithoutSign,
    setIsEnable,
    setPatient,
}: Props) {
    const navigate = useNavigate();
    const [checkbox, setCheckbox] = useState([true, false, false]);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [prescriptionType, setPrescriptionType] = useState(1);
    const [cpf, setCPF] = useState("");
    const [loading, setLoading] = useState(false);
    const [fullPatient, setFullPatient] = useState<IPatientDto>();
    const {
        isOpen: isOpenAddCPF,
        onOpen: onOpenAddCPF,
        onClose: onCloseAddCPF,
    } = useDisclosure();
    function check(index: number) {
        checkbox[index] = !checkbox[index];
        checkbox.forEach((_, idx: number) => {
            if (index !== idx) {
                checkbox[idx] = false;
            }
        });
        setCheckbox(checkbox);
        forceUpdate();
    }

    async function getPatientInfo() {
        const result = await getPatientById(patient.patientId);
        setFullPatient(result);
    }

    async function savePrescription(
        values: ICreatePrescriptionCompositionDto[],
        cpf: string,
    ) {
        try {
            const shouldSave =
                isCPF(patient.cpf) ||
                isCPF(cpf) ||
                prescriptionType === PrescriptionTypeEnum.PRESCRIPTION ||
                patient.hasResponsible;

            if (isCPF(cpf) && !patient.hasResponsible) {
                const result = await receitaCpfApi(cpf);

                if (typeof setPatient === "function") {
                    const newPatient = JSON.parse(JSON.stringify(patient));
                    newPatient.cpf = cpf;
                    setPatient(newPatient);
                }
                await patchPatient(String(patient.id), {
                    cpf,
                    name: result.nome ? result.nome : patient.name,
                });
            }

            let hasEmptyAddressInfo = false;
            const hasAddress = Boolean(fullPatient?.address?.cep);

            for (const prop of Object.keys(
                fullPatient?.address as IPatientAddressDto,
            )) {
                if (!fullPatient?.address[prop]) {
                    hasEmptyAddressInfo = true;
                }
            }
            const shouldShowError =
                hasEmptyAddressInfo &&
                !hasAddress &&
                [
                    PrescriptionTypeEnum.CONTROLLED_RECIPE,
                    PrescriptionTypeEnum.ANTIMICROBIAL_PRESCRIPTION,
                ].includes(prescriptionType);

            if (shouldShowError) {
                window.scrollTo(0, 0);

                toast.error(
                    <ToastMessage
                        title="Erro"
                        description="Preencha o endereço do paciente."
                    />,
                );
                if (
                    typeof setIsEnableWithoutSign === "function" &&
                    typeof setIsEnable === "function"
                ) {
                    setIsEnableWithoutSign(false);
                    setIsEnable(false);
                }
                onClose();
                return;
            } else {
                if (shouldSave) {
                    const compositions = values.filter(
                        (composition) =>
                            composition !== undefined && composition !== null,
                    );

                    const onlyValidCompositions = compositions.filter((pc) =>
                        verifyIsEmpty(pc),
                    );
                    if (onlyValidCompositions.length > 0) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="Você não pode salvar um documento vazio"
                            />,
                        );
                        return;
                    }

                    const unregularIndustrializedComposotion =
                        compositions.filter(
                            (pc: ICreatePrescriptionCompositionDto) =>
                                (pc?.medicineId && !pc?.dosage) ||
                                (!pc?.medicineId && pc?.dosage),
                        );

                    if (unregularIndustrializedComposotion.length > 0) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="Todos os industrializados devem conter um texto de posologia e um medicamento!"
                            />,
                        );
                        return;
                    }
                    setLoading(true);
                    const payload: ICreatePrescriptionDto = {
                        documentTypeId,
                        doctorId: Number(doctorId),
                        patientId: patient.patientId,
                        prescriptionType,
                        prescriptionComposition:
                            compositions as unknown as ICreatePrescriptionCompositionDto[],
                        signed,
                        shouldShowDate: showDateOnPDF,
                    };
                    const prescription = await createPrescription(payload);
                    if (
                        signed &&
                        !isCPF(String(patient?.cpf)) &&
                        !patient?.hasResponsible
                    ) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="Usuário sem CPF!"
                            />,
                        );

                        return;
                    }
                    const shouldSign =
                        (signed &&
                            isCPF(String(patient?.cpf)) &&
                            !patient?.hasResponsible) ||
                        (signed &&
                            isCPF(String(patient?.responsibleCPF)) &&
                            patient?.hasResponsible);

                    if (shouldSign) {
                        const newW = 800;
                        const newH = 850;
                        const left = (window.screen.width - newW) / 2;
                        const top = 100;

                        const result = await signDocument(
                            prescription.id,
                            true,
                        );

                        const aba = window.open(
                            result?.signature?.url,
                            "MRD",
                            `resizable=yes,
                        width=${newW},
                        height=${newH},
                        top=${top},
                        left=${left},
                        scrollbars=yes,
                        statusbar=no,
                        resizable=no,
                        toolbar=0,
                        titlebar=MRD`,
                        );
                        if (
                            !aba ||
                            aba.closed ||
                            typeof aba.closed === "undefined"
                        ) {
                            toast.warning(
                                <ToastMessage
                                    title="Popup"
                                    description="Habilite o Popup do seu navegador!"
                                />,
                            );
                            return;
                        }

                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        const timer = setInterval(async function () {
                            try {
                                if (aba?.closed) {
                                    await updateSignDocument(
                                        prescription.id,
                                        false,
                                    );
                                    clearInterval(timer);
                                    setLoading(false);
                                    setLink(prescription.link);
                                    setPrescriptionId(prescription.id);
                                    setEnableModal(true);
                                    onOpenCreatedModal();
                                    const docId =
                                        await asyncLocalStorage.getItem(
                                            localStorageKeys.DOCTOR_ID,
                                        );
                                    navigate(`/showPrescriptions/${docId}`);
                                    toast.warning(
                                        <ToastMessage
                                            title="Atenção!"
                                            description="Documento criado, mais não foi possível assinar!"
                                        />,
                                    );

                                    return;
                                }

                                const data = await getDocStatus(
                                    result?.signature?.idDocument,
                                );

                                if (data?.status === "F") {
                                    clearInterval(timer);
                                    aba?.close();
                                    prescription.link = result?.link;
                                    setLoading(false);
                                    setLink(prescription.link);
                                    setPrescriptionId(prescription.id);
                                    setEnableModal(true);
                                    onOpenCreatedModal();
                                    toast.success(
                                        "Documento criado com sucesso!",
                                    );
                                    toast.success(
                                        <ToastMessage
                                            title="Documento assiando"
                                            description="Documento assinado com sucesso!"
                                        />,
                                    );
                                }
                            } catch (error) {
                                setLoading(false);
                                toast.error(
                                    <ToastMessage
                                        title="Error"
                                        description="Erro ao assinar documento!"
                                    />,
                                );
                            }
                        }, 10000);
                    } else {
                        setLoading(false);
                        setPrescriptionId(prescription.id);
                        setLink(prescription.link);
                        toast.success("Documento criado com sucesso!");
                        setEnableModal(true);
                        onOpenCreatedModal();
                    }
                }
            }
        } catch (error: any) {
            console.log(error);
            setLoading(false);
            const errorMessage = error.title
                ? error.title
                : "Erro ao criar documento";
            toast.error(
                <ToastMessage description={errorMessage} title="Erro" />,
            );
        }
    }

    function handleSubmit() {
        const cpfIsRequired =
            (!isCPF(patient.cpf) &&
                [
                    PrescriptionTypeEnum.ANTIMICROBIAL_PRESCRIPTION,
                    PrescriptionTypeEnum.CONTROLLED_RECIPE,
                ].includes(prescriptionType) &&
                !patient.hasResponsible) ||
            (!isCPF(patient.cpf) && signed && !patient.hasResponsible);
        if (cpfIsRequired) {
            onOpenAddCPF();
        } else {
            void savePrescription(
                payload as ICreatePrescriptionCompositionDto[],
                "",
            );
        }
    }

    useEffect(() => {
        void getPatientInfo();
    }, [fullPatient]);
    return (
        <>
            <Text onClick={onOpen}>{text}</Text>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                        Qual tipo de prescrição deseja emitir?
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <AddCPF
                            isOpen={isOpenAddCPF}
                            onOpen={onOpenAddCPF}
                            onClose={() => {
                                if (isCPF(cpf)) {
                                    void savePrescription(
                                        payload as ICreatePrescriptionCompositionDto[],
                                        cpf,
                                    );
                                }
                                onCloseAddCPF();
                            }}
                            cpf={cpf}
                            text=""
                            setCPF={setCPF}
                        />
                        <Flex flexDirection="column">
                            <Flex
                                flexDirection="row"
                                flexWrap="wrap"
                                justifyContent="space-evenly"
                                border="1px solid #EDEDF3"
                                boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
                                borderRadius="8px"
                                width="100%"
                                height=" 60px"
                                alignContent="center"
                                marginTop="10px"
                            >
                                <Checkbox
                                    colorScheme="red"
                                    size="lg"
                                    onChange={() => {
                                        check(0);
                                        setPrescriptionType(
                                            PrescriptionTypeEnum.PRESCRIPTION,
                                        );
                                    }}
                                    isChecked={checkbox[0]}
                                />
                                <Box
                                    width="55%"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                >
                                    <Text fontWeight={900} color="#202D46">
                                        Simples
                                    </Text>
                                </Box>
                            </Flex>
                            <Flex
                                flexDirection="row"
                                flexWrap="wrap"
                                justifyContent="space-evenly"
                                border="1px solid #EDEDF3"
                                boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
                                borderRadius="8px"
                                width="100%"
                                height=" 60px"
                                alignContent="center"
                                marginTop="10px"
                            >
                                <Checkbox
                                    colorScheme="red"
                                    size="lg"
                                    onChange={() => {
                                        check(1);
                                        setPrescriptionType(
                                            PrescriptionTypeEnum.CONTROLLED_RECIPE,
                                        );
                                    }}
                                    isChecked={checkbox[1]}
                                />
                                <Box
                                    width="55%"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                >
                                    <Text fontWeight={900} color="#202D46">
                                        Receita Controlada
                                    </Text>
                                </Box>
                            </Flex>
                            <Flex
                                flexDirection="row"
                                flexWrap="wrap"
                                justifyContent="space-evenly"
                                border="1px solid #EDEDF3"
                                boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
                                borderRadius="8px"
                                width="100%"
                                height=" 60px"
                                alignContent="center"
                                marginTop="10px"
                            >
                                <Checkbox
                                    colorScheme="red"
                                    size="lg"
                                    onChange={() => {
                                        check(2);
                                        setPrescriptionType(
                                            PrescriptionTypeEnum.ANTIMICROBIAL_PRESCRIPTION,
                                        );
                                    }}
                                    isChecked={checkbox[2]}
                                />
                                <Box
                                    width="55%"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                >
                                    <Text fontWeight={900} color="#202D46">
                                        Receita de Antimicrobiano
                                    </Text>
                                </Box>
                            </Flex>
                        </Flex>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            disable={checkbox.every((value) => !value)}
                            bgColor="#D72A34"
                            textColor="#FFFFFF"
                            fontSize={14}
                            hasIcon={false}
                            text="Continuar"
                            type="submit"
                            onClick={() => handleSubmit()}
                            isLoading={loading}
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
