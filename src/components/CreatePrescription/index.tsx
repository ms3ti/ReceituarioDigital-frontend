import { Box, Center, Flex, Text, useDisclosure } from "@chakra-ui/react";
import { useFormik } from "formik";
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useReducer,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useAccount } from "../../contexts/accountContext";
import { IListPatient } from "../../interfaces/patient/create.patient.dto";
import { ICreatePrescriptionDto } from "../../interfaces/prescription/create.prescription.dto";
import { IPrescriptionCompositionDto } from "../../interfaces/prescription/prescription.composition.dto";
import { IPrescriptionDto } from "../../interfaces/prescription/prescription.dto";
import { ICreatePrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";
import {
    IPrescriptionCompositionModel,
    IPrescriptionModel,
} from "../../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { createPrescription } from "../../services/createPrescription";
import { getDocStatus } from "../../services/getDocStatus";
import { signDocument } from "../../services/signDocument";
import { updateSignDocument } from "../../services/updateSignDocument";
import {
    documentTypeIdToName,
    documentTypeList,
    documentTypeNameToId,
} from "../../utils/documentTypeList";
import { DocumentTypeNameEnum } from "../../utils/enum/Document.type.name.enum";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { formatCompositions } from "../../utils/formatComposition";
import { verifyIsEmpty, verifyIsFreeText } from "../../utils/verifyIsText";
import { BoxTitle } from "../BoxTitle";
import { Button } from "../Button";

import { CreatePrescriptionModel } from "../CreatePrescriptionModel";
import { ExamSearch } from "../examSearch";
import { FormError } from "../FormError";
import { FreeTextPrescription } from "../FreeTextPrescription";
import { IndustrializedPrescription } from "../IndustrializedPrescription";
import { Input } from "../Input";
import { ListPrescriptionModel } from "../ListPrescriptionModel";
import { PrescriptionCreatedModal } from "../PrescriptionCreatedModal";
import { Select } from "../Select";
import { SelectPrescriptionType } from "../SelectPrescriptionType";
import { ShouldShowDateOnPDF } from "../ShouldShowDateOnPDF";
import { ToastMessage } from "../ToastMessage";
import { formatToCPF } from "brazilian-values";
import { formatDateddMMyyyy } from "../../utils/formatDateddMMyyyy";
import { PrescriptionTypeEnum } from "../../utils/enum/prescription.type.enum";

interface Props {
    patient: IListPatient;
    setPatient: Dispatch<SetStateAction<IListPatient | undefined>>;
}

const emptyPC: ICreatePrescriptionCompositionDto = {
    activePrinciple: "",
    description: "",
    dosage: "",
    medicine: "",
    packing: "",
    orientation: "",
    isOrientation: false,
    isContent: false,
    isTitle: false,
    isJustification: false,
    examId: 0,
    medicineId: 0,
    quantity: 1,
};

const emptyFreeText: ICreatePrescriptionCompositionDto = {
    activePrinciple: null,
    description: "",
    dosage: null,
    medicine: null,
    packing: null,
    orientation: null,
    isOrientation: false,
    isContent: false,
    isTitle: false,
    isJustification: false,
    examId: 0,
    medicineId: 0,
    quantity: 0,
};

export function CreatePrescription({ patient, setPatient }: Props) {
    const navigate = useNavigate();
    const account = useAccount();

    const [prescriptionId, setPrescriptionId] = useState<number>();
    const [signed, setSigned] = useState<boolean>(false);
    const [isEnable, setIsEnable] = useState<boolean>(false);
    const [isEnableWithoutSign, setIsEnableWithoutSign] =
        useState<boolean>(false);
    const [enableModal, setEnableModal] = useState<boolean>(false);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [indexOfFreeText, setIndexOfFreeText] = useState<boolean[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [id, setId] = useState<number>();
    const [payload, setPayload] =
        useState<ICreatePrescriptionCompositionDto[]>();
    const [documentId, setDocumentId] = useState("");
    const [certificateHour, setCertificateHour] = useState("");
    const [certificateDate, setCertificateDate] = useState("");
    const [addressIsEmpty, setAddressIsEmpty] = useState<boolean>(false);

    const [certificateOrientation, setCertificateOrientation] = useState(
        `Atesto para devidos fins que ${patient.name}, ${
            patient.cpf ? `CPF: ${formatToCPF(patient.cpf)}` : ""
        }, ${
            addressIsEmpty
                ? ""
                : `residente e domiciliado(a) à ${patient.address?.street}, ${patient.address?.number}, ${patient.address?.city}, ${patient.address?.state}, ${patient.address?.cep}`
        } esteve sob tratamento médico neste consultório no dia ${certificateDate} às ${certificateHour}.`,
    );
    const [justification, setJustification] = useState("");
    const [isFormValid, setIsFormValid] = useState(true);
    const [link, setLink] = useState("");
    const [showDateOnPDF, setShowDateOnPDF] = useState(true);
    const [examList, setExamList] = useState<
        ICreatePrescriptionCompositionDto[]
    >([
        {
            activePrinciple: null,
            description: "",
            dosage: null,
            medicine: null,
            packing: null,
            orientation: null,
            isOrientation: false,
            isContent: false,
            isTitle: false,
            isJustification: false,
            examId: 0,
            medicineId: 0,
            quantity: 1,
        },
    ]);
    const {
        isOpen: isOpenCreatedModal,
        onOpen: onOpenCreatedModal,
        onClose: onCloseCreatedModal,
    } = useDisclosure();
    const {
        isOpen: isOpenPrescriptionType,
        onOpen: onOpenPrescriptionType,
        onClose: onClosePrescriptionType,
    } = useDisclosure();

    const isCertified = documentId === DocumentTypeNameEnum.CERTIFICATE;

    const isOthers = documentId === DocumentTypeNameEnum.OTHERS;

    const isExamRequest = documentId === DocumentTypeNameEnum.EXAM_REQUEST;

    const isPrescription = documentId === DocumentTypeNameEnum.PRESCRIPTION;

    function closePrescriptionType() {
        onClosePrescriptionType();
        setIsEnableWithoutSign(false);
        setIsEnable(false);
    }

    async function getDoctorId() {
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        setId(Number(docId));
    }

    async function saveRawPrescription() {
        const obj = {
            formikValues: formik.values,
            formikInitialValues: formik.initialValues,
            documentId,
            certificateHour,
            certificateDate,
            certificateOrientation,
            justification,
            indexOfFreeText,
            title,
            content,
            examList,
            patient,
        };
        await asyncLocalStorage.setItem(
            localStorageKeys.TEMP_DOCUMENT,
            JSON.stringify(obj),
        );
    }

    async function setRawPrescription() {
        const tempDoc = await asyncLocalStorage.getItem(
            localStorageKeys.TEMP_DOCUMENT,
        );
        if (tempDoc?.length) {
            const result = JSON.parse(String(tempDoc));

            if (Object.keys(result)?.length > 0) {
                formik.initialValues = result.formikValues;

                formik.values = result.formikValues;
                await formik.setValues(result.formikValues);

                setDocumentId(result.documentId);
                setCertificateHour(result.certificateHour);
                setCertificateDate(result.certificateDate);
                setCertificateOrientation(result.certificateOrientation);
                setJustification(result.justification);
                setIndexOfFreeText(result.indexOfFreeText);
                setTitle(result.title);
                setContent(result.content);
                setExamList(result.examList);
                await asyncLocalStorage.setItem(
                    localStorageKeys.TEMP_DOCUMENT,
                    JSON.stringify({}),
                );
                forceUpdate();
            }
        }

        const repeatDoc = await asyncLocalStorage.getItem(
            localStorageKeys.PRESCRIPTION_REPEAT,
        );
        if (repeatDoc?.length) {
            const resultRepeatDoc: IPrescriptionDto = JSON.parse(
                String(repeatDoc),
            );
            setDocumentId(documentTypeIdToName[resultRepeatDoc.documentTypeId]);
            if (Object.keys(resultRepeatDoc)?.length > 0) {
                if (resultRepeatDoc.date && resultRepeatDoc.hour) {
                    setCertificateDate(resultRepeatDoc.date);
                    setCertificateHour(resultRepeatDoc.hour);
                }
                setExamList([]);
                const aux: IPrescriptionCompositionDto[] = [];
                resultRepeatDoc.prescriptionCompositons.forEach(
                    (pc: IPrescriptionCompositionDto) => {
                        if (pc.isContent) {
                            setContent(pc.description);
                        }
                        if (pc.isJustification) {
                            setJustification(pc.description);
                        }
                        if (pc.isOrientation) {
                            setCertificateOrientation(pc.description);
                        }
                        if (pc.isTitle) {
                            setTitle(pc.description);
                        }
                        if (pc.examId !== 0) {
                            aux.push(pc);
                        }
                    },
                );
                setExamList(aux);

                const normalCompositions =
                    resultRepeatDoc.prescriptionCompositons.filter(
                        (pcm: IPrescriptionCompositionDto) =>
                            !pcm.isContent &&
                            !pcm.isJustification &&
                            !pcm.isOrientation &&
                            !pcm.isTitle &&
                            !pcm.examId,
                    );

                const normalCompositionsFormated = normalCompositions.map(
                    (pcm: IPrescriptionCompositionDto) => {
                        return {
                            ...pcm,
                            orientation: "",
                        };
                    },
                );

                const validateMergedArray = normalCompositionsFormated.map(
                    (pc) => {
                        return {
                            activePrinciple: pc.activePrinciple
                                ? pc.activePrinciple
                                : "",
                            description: pc.description,
                            dosage: pc.dosage ? pc.dosage : "",
                            medicine: pc.medicine ? pc.medicine : "",
                            packing: pc.packing ? pc.packing : "",
                            orientation: pc.orientation,
                            isOrientation: pc.isOrientation,
                            isContent: pc.isContent,
                            isTitle: pc.isTitle,
                            isJustification: pc.isJustification,
                            examId: pc.examId,
                            medicineId: pc.medicineId,
                            quantity: pc.quantity,
                        };
                    },
                );

                await formik.setValues(validateMergedArray);
                formik.values = validateMergedArray;
                formik.initialValues = validateMergedArray;

                formik.values.forEach(
                    (pc: ICreatePrescriptionCompositionDto, index: number) => {
                        if (verifyIsFreeText(pc)) {
                            indexOfFreeText[index] = true;
                        }
                    },
                );
                await asyncLocalStorage.setItem(
                    localStorageKeys.PRESCRIPTION_REPEAT,
                    JSON.stringify({}),
                );
                forceUpdate();
            }
        }
    }

    const validationSchema = Yup.object().shape({
        activePrinciple: Yup.string().required("O campo é obrigatório."),
        description: Yup.string().required("O campo é obrigatório."),
        dosage: Yup.string().required("O campo é obrigatório."),
        medicine: Yup.string().required("O campo é obrigatório."),
        packing: Yup.string().required("O campo é obrigatório."),
    });

    const formik = useFormik({
        initialValues: [
            {
                activePrinciple: "",
                description: "",
                dosage: "",
                medicine: "",
                packing: "",
                orientation: "",
                isOrientation: false,
                isContent: false,
                isTitle: false,
                isJustification: false,
                examId: 0,
                medicineId: 0,
                quantity: 1,
            },
        ],
        validationSchema,
        onSubmit: async (values: ICreatePrescriptionCompositionDto[]) => {
            if (signed) {
                setIsEnableWithoutSign(false);
                setIsEnable(true);
            } else {
                setIsEnableWithoutSign(true);
                setIsEnable(false);
            }

            if (isExamRequest && isFormValid) {
                toast.info(
                    <ToastMessage
                        title="Atenção"
                        description="Selecione um tipo de exame para prosseguir"
                    />,
                );
                setIsEnableWithoutSign(false);
                setIsEnable(false);
                return;
            }
            setPayload(values);
            const emptyExams = examList.filter((exam) => exam.examId === 0);
            if (emptyExams.length > 0 && isExamRequest) {
                toast.info(
                    <ToastMessage
                        title="Atenção"
                        description="Você deve selecionar um exame!"
                    />,
                );
                setIsEnableWithoutSign(false);
                setIsEnable(false);
                return;
            }

            if (isPrescription) {
                const verifyFields = values.filter((value) => {
                    if (value === undefined) return null;
                    return value;
                });

                if (verifyFields.length === 0) {
                    toast.error(
                        <ToastMessage
                            title="Erro"
                            description="Você não pode salvar um documento vazio"
                        />,
                    );
                    setIsEnableWithoutSign(false);
                    setIsEnable(false);
                    return;
                } else {
                    onOpenPrescriptionType();
                }
            }
            const certificateOrOthersOrExamRequest =
                isCertified || isOthers || isExamRequest;

            if (certificateOrOthersOrExamRequest) {
                try {
                    const formatedCompositions = formatCompositions(values);

                    const compositions = formatedCompositions.filter(
                        (composition) => {
                            if (
                                composition !== undefined &&
                                verifyIsFreeText(composition)
                            ) {
                                return composition;
                            }
                            return null;
                        },
                    );

                    if (justification?.length > 0) {
                        compositions.push({
                            activePrinciple: null,
                            description: justification,
                            dosage: null,
                            medicine: null,
                            packing: null,
                            orientation: null,
                            isOrientation: false,
                            isContent: false,
                            isTitle: false,
                            isJustification: true,
                            examId: 0,
                            medicineId: 0,
                            quantity: 0,
                        });
                    }
                    
                    if (isCertified) {
                        if (certificateOrientation?.length > 0) {
                            compositions.push({
                                activePrinciple: null,
                                description: certificateOrientation,
                                dosage: null,
                                medicine: null,
                                packing: null,
                                orientation: null,
                                isOrientation: true,
                                isContent: false,
                                isTitle: false,
                                isJustification: false,
                                examId: 0,
                                medicineId: 0,
                                quantity: 0,
                            });
                        }
                    }


                    if (content?.length > 0) {
                        compositions.push({
                            activePrinciple: null,
                            description: content,
                            dosage: null,
                            isContent: true,
                            isOrientation: false,
                            isJustification: false,
                            isTitle: false,
                            medicine: null,
                            packing: null,
                            orientation: null,
                            examId: 0,
                            medicineId: 0,
                            quantity: 0,
                        });
                    }

                    if (title?.length > 0) {
                        compositions.push({
                            activePrinciple: null,
                            description: title,
                            dosage: null,
                            isContent: false,
                            isOrientation: false,
                            isTitle: true,
                            medicine: null,
                            packing: null,
                            orientation: null,
                            isJustification: false,
                            examId: 0,
                            medicineId: 0,
                            quantity: 0,
                        });
                    }
                    const validExams = examList.filter(
                        (exam) => exam.examId !== 0,
                    );
                    if (validExams?.length > 0) {
                        validExams.forEach(
                            (pc: ICreatePrescriptionCompositionDto) => {
                                compositions.push({
                                    activePrinciple: null,
                                    description: "",
                                    dosage: null,
                                    isContent: false,
                                    isOrientation: false,
                                    isTitle: false,
                                    medicine: null,
                                    packing: null,
                                    orientation: null,
                                    isJustification: false,
                                    examId: pc.examId,
                                    medicineId: 0,
                                    quantity: 0,
                                });
                            },
                        );
                    }
                    const onlyValidCompositions = compositions.filter(
                        (pc) => !verifyIsEmpty(pc),
                    );
                    if (onlyValidCompositions?.length === 0) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="Você não pode salvar um documento vazio"
                            />,
                        );
                        setIsEnableWithoutSign(false);
                        setIsEnable(false);
                        return;
                    }

                    const payload: ICreatePrescriptionDto = {
                        documentTypeId:
                            documentTypeNameToId[String(documentId)],
                        doctorId: Number(id),
                        patientId: patient.patientId,
                        prescriptionComposition:
                            onlyValidCompositions as unknown as ICreatePrescriptionCompositionDto[],
                        date: certificateDate,
                        hour: certificateHour,
                        signed,
                        shouldShowDate: showDateOnPDF,
                        prescriptionType: isPrescription ? PrescriptionTypeEnum.PRESCRIPTION : undefined
                    };
                    const prescription = await createPrescription(payload);

                    if (signed) {
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
                            setIsEnable(false);
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
                                    setIsEnable(false);
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
                                    setIsEnableWithoutSign(false);
                                    setIsEnable(false);
                                    return;
                                }

                                const data = await getDocStatus(
                                    result?.signature?.idDocument,
                                );

                                if (data?.status === "F") {
                                    clearInterval(timer);
                                    aba?.close();
                                    prescription.link = result?.link;
                                    setIsEnable(false);
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
                                setIsEnable(false);
                                toast.error(
                                    <ToastMessage
                                        title="Error"
                                        description="Erro ao assinar documento!"
                                    />,
                                );
                            }
                        }, 10000);
                    } else {
                        setIsEnableWithoutSign(false);
                        setLink(prescription.link);
                        setPrescriptionId(prescription.id);
                        setEnableModal(true);
                        onOpenCreatedModal();
                        toast.success("Documento criado com sucesso!");
                    }
                } catch (error) {
                    console.log(error);
                    setIsEnableWithoutSign(false);
                    setIsEnable(false);
                    toast.error(
                        <ToastMessage
                            title="Erro"
                            description="Erro ao criar documento"
                        />,
                    );
                }
            }
        },
    });

    function addNewExam() {
        const aux = examList;
        aux.push({
            activePrinciple: null,
            description: "",
            dosage: null,
            medicine: null,
            packing: null,
            isOrientation: false,
            isContent: false,
            isTitle: false,
            isJustification: false,
            examId: 0,
            medicineId: 0,
            quantity: 0,
        });
        setExamList(aux);
        forceUpdate();
    }

    function removeExam(index: number) {
        const examIdList = examList;
        examIdList.splice(index, 1);
        setExamList(examIdList);
        forceUpdate();
    }

    function addNewPrescriptionComposition() {
        formik.values.push(emptyPC as any);
        forceUpdate();
    }

    function addNewFreeText() {
        formik.values.push(emptyFreeText as any);
        const index = formik.values?.length - 1;
        indexOfFreeText[index] = true;
        setIndexOfFreeText(indexOfFreeText);
        forceUpdate();
    }

    function removePrescriptionComposition(index: number) {
        formik.initialValues[index] = undefined as any;
        formik.values[index] = undefined as any;

        if (indexOfFreeText[index]) {
            indexOfFreeText[index] = false;
        }

        forceUpdate();
    }

    async function setModelToPrescription(
        prescriptionModel: IPrescriptionModel,
    ): Promise<void> {
        if (prescriptionModel.date && prescriptionModel.hour) {
            setCertificateDate(prescriptionModel.date);
            setCertificateHour(prescriptionModel.hour);
        }

        let removeFirstExam = false;

        prescriptionModel.prescriptionCompositonsModels.forEach(
            (pcm: IPrescriptionCompositionModel) => {
                if (pcm.isContent) {
                    setContent(pcm.description);
                }
                if (pcm.isJustification) {
                    setJustification(pcm.description);
                }
                if (pcm.isOrientation) {
                    setCertificateOrientation(pcm.description);
                }
                if (pcm.isTitle) {
                    setTitle(pcm.description);
                }
                if (pcm.examId > 0) {
                    if (!removeFirstExam) {
                        removeFirstExam = true;
                    }
                    const aux = examList;
                    aux.push(pcm);
                    setExamList(aux);
                }
            },
        );

        if (
            formik.values[0]?.medicineId === 0 &&
            formik.values[0]?.dosage === "" &&
            formik.values[0]?.description === ""
        ) {
            formik.values.splice(0, 1);
        }

        if (removeFirstExam && examList[0]?.examId === 0) {
            const aux = examList;
            aux.splice(0, 1);
            setExamList(aux);
        }

        const normalCompositions =
            prescriptionModel.prescriptionCompositonsModels.filter(
                (pcm: IPrescriptionCompositionModel) =>
                    !pcm.isContent &&
                    !pcm.isJustification &&
                    !pcm.isOrientation &&
                    !pcm.isTitle &&
                    !pcm.examId,
            );
        const normalCompositionsFormated = normalCompositions.map(
            (pcm: IPrescriptionCompositionModel) => {
                return {
                    ...pcm,
                    orientation: "",
                };
            },
        );

        const mergedArray = [
            ...formik.values,
            ...normalCompositionsFormated.reverse(),
        ];

        await formik.setValues([
            ...formik.values,
            ...normalCompositionsFormated,
        ]);
        formik.values = mergedArray;
        formik.initialValues = mergedArray;

        formik.values.forEach(
            (pc: ICreatePrescriptionCompositionDto, index: number) => {
                if (verifyIsFreeText(pc)) {
                    indexOfFreeText[index] = true;
                }
            },
        );
        forceUpdate();
    }

    function returnDocumentComponent(
        component: ICreatePrescriptionCompositionDto,
        index: number,
    ) {
        if (typeof component === "object" && component !== null) {
            if (indexOfFreeText[index]) {
                return (
                    <FreeTextPrescription
                        key={index}
                        index={index}
                        handleChange={formik.handleChange}
                        descriptionValue={formik.values[index]?.description}
                        descriptionId={`${index}.description`}
                        removeFunction={removePrescriptionComposition}
                        label="Texto Livre"
                        placeholder="Texto Livre"
                        showRemoveButton
                        textArea
                        paddingTopTextArea="15px"
                    />
                );
            } else if (isPrescription) {
                return (
                    <IndustrializedPrescription
                        key={index}
                        index={index}
                        handleChange={formik.handleChange}
                        dosageValue={formik.values[index]?.dosage}
                        dosageId={`${index}.dosage`}
                        removeFunction={removePrescriptionComposition}
                        medicineIdValue={formik.values[index]?.medicineId}
                        setFieldValue={formik.setFieldValue}
                        quantityId={`${index}.quantity`}
                        quantityName={`${index}.quantity`}
                        quantityValue={formik.values[index]?.quantity}
                    />
                );
            }
        }
    }

    const justificationField = (
        <>
            <Box
                backgroundColor={"#F7F8FA"}
                padding="15px"
                width={{ base: "100%", md: "1000px" }}
                marginBottom="20px"
                borderRadius="4px"
                boxShadow="md"
            >
                <BoxTitle text="Justificativa" />
                <Input
                    placeholder="Justificativa"
                    value={justification}
                    onChange={(e: any) => setJustification(e.target.value)}
                />
            </Box>
        </>
    );

    const otherFields = (
        <>
            <Box
                backgroundColor={"#F7F8FA"}
                padding="15px"
                width={{ base: "100%", md: "1000px" }}
                marginBottom="20px"
                borderRadius="4px"
                boxShadow="md"
            >
                <BoxTitle text="Documento" />
                <Input
                    required
                    placeholder="Título do documento"
                    value={title}
                    onChange={(e: any) => setTitle(e.target.value)}
                />
                {title?.length > 0 ? null : (
                    <FormError message="O titulo é obrigatório" />
                )}
                <Input
                    required
                    placeholder="Conteúdo"
                    value={content}
                    onChange={(e: any) => setContent(e.target.value)}
                    textArea
                    paddingTopTextArea="15px"
                />
                {content?.length > 0 ? null : (
                    <FormError message="O conteúdo é obrigatório" />
                )}
            </Box>
        </>
    );

    useEffect(() => {
        if (isExamRequest) {
            setIsFormValid(false);
        } else {
            setIsFormValid(examList[0]?.examId !== 0);
            forceUpdate();
        }
    }, [examList]);

    useEffect(() => {
        void getDoctorId();
        void setRawPrescription();
        forceUpdate();
    }, []);

    useEffect(() => {
        let hasEmptyAddressInfo = false;
        const hasAddress = Boolean(patient?.address?.cep);
        if (patient?.address) {
            for (const prop of Object.keys(patient?.address)) {
                if (!patient?.address[prop]) {
                    hasEmptyAddressInfo = true;
                }
            }
        }
        setAddressIsEmpty(hasEmptyAddressInfo && !hasAddress);

        setCertificateOrientation(
            `Atesto para devidos fins que ${patient.name}${
                patient.cpf ? `, CPF: ${formatToCPF(patient.cpf)}` : ""
            }, ${
                hasEmptyAddressInfo && !hasAddress
                    ? ""
                    : `residente e domiciliado(a) à ${patient.address?.street}, ${patient.address?.number}, ${patient.address?.city}, ${patient.address?.state}, ${patient.address?.cep}`
            } esteve sob tratamento médico neste consultório no dia ${formatDateddMMyyyy(
                certificateDate,
            )} às ${certificateHour}.`,
        );
    }, [patient]);

    return (
        <>
            <form onSubmit={formik.handleSubmit}>
                <Flex
                    flexDirection="column"
                    width="100%"
                    alignItems="center"
                    paddingBottom="100px"
                >
                    <Box
                        backgroundColor={"#F7F8FA"}
                        padding="15px"
                        width={{ base: "100%", md: "1000px" }}
                        marginBottom="20px"
                        borderRadius="4px"
                        boxShadow="md"
                    >
                        <BoxTitle text="Tipo de Documento" />
                        <Select
                            placeholder="Tipo de Documento"
                            options={documentTypeList}
                            id={""}
                            name={""}
                            width="100%"
                            onChange={(e: any) => {
                                setDocumentId(e.target.value);
                                if (e.target.value === "") {
                                    removePrescriptionComposition(1);
                                    indexOfFreeText[0] = false;
                                }
                                if (isPrescription) {
                                    indexOfFreeText[0] = false;
                                }
                                if (isCertified) {
                                    indexOfFreeText[0] = false;
                                }
                            }}
                            value={documentId}
                        />
                        {documentId ? null : (
                            <FormError message="Selecione o tipo de documento" />
                        )}
                    </Box>
                    {isOthers ? otherFields : null}

                    {isCertified ? (
                        <Box
                            backgroundColor={"#F7F8FA"}
                            padding="15px"
                            width={{ base: "100%", md: "1000px" }}
                            marginBottom="10px"
                            borderRadius="4px"
                            boxShadow="md"
                        >
                            <BoxTitle text="Data e hora do atendimento" />
                            <Flex
                                flexDirection={{
                                    base: "column",
                                    md: "row",
                                }}
                            >
                                <Flex flexDirection="column" width="100%">
                                    <Input
                                        name="certificateDate"
                                        required
                                        placeholder="Data"
                                        width={{ base: "100%", md: "98%" }}
                                        type="date"
                                        value={certificateDate}
                                        onChange={(e: any) => {
                                            let hasEmptyAddressInfo = false;
                                            const hasAddress = Boolean(
                                                patient?.address?.cep,
                                            );
                                            if (patient?.address) {
                                                for (const prop of Object.keys(
                                                    patient?.address,
                                                )) {
                                                    if (
                                                        !patient?.address[prop]
                                                    ) {
                                                        hasEmptyAddressInfo =
                                                            true;
                                                    }
                                                }
                                            }
                                            setCertificateDate(e.target.value);
                                            setCertificateOrientation(
                                                `Atesto para devidos fins que ${
                                                    patient.name
                                                }, ${
                                                    patient.cpf
                                                        ? `CPF: ${formatToCPF(
                                                              patient.cpf,
                                                          )}`
                                                        : ""
                                                }, ${
                                                    hasEmptyAddressInfo &&
                                                    !hasAddress
                                                        ? ""
                                                        : `residente e domiciliado(a) à ${patient.address?.street}, ${patient.address?.number}, ${patient.address?.city}, ${patient.address?.state}, ${patient.address?.cep}`
                                                } esteve sob tratamento médico neste consultório no dia ${formatDateddMMyyyy(
                                                    e.target.value,
                                                )} às ${certificateHour}.`,
                                            );
                                        }}
                                        min={6}
                                    />
                                    {certificateDate?.length > 0 ? null : (
                                        <FormError message="A Data de atendimento é obrigatório" />
                                    )}
                                </Flex>
                                <Flex flexDirection="column" width="100%">
                                    <Input
                                        name="certificateHour"
                                        required
                                        placeholder="Hora"
                                        width="100%"
                                        value={certificateHour}
                                        onChange={(e: any) => {
                                            let hasEmptyAddressInfo = false;
                                            const hasAddress = Boolean(
                                                patient?.address?.cep,
                                            );
                                            if (patient?.address) {
                                                for (const prop of Object.keys(
                                                    patient?.address,
                                                )) {
                                                    if (
                                                        !patient?.address[prop]
                                                    ) {
                                                        hasEmptyAddressInfo =
                                                            true;
                                                    }
                                                }
                                            }
                                            setCertificateHour(e.target.value);
                                            setCertificateOrientation(
                                                `Atesto para devidos fins que ${
                                                    patient.name
                                                }, ${
                                                    patient.cpf
                                                        ? `CPF: ${formatToCPF(
                                                              patient.cpf,
                                                          )}`
                                                        : ""
                                                }, ${
                                                    hasEmptyAddressInfo &&
                                                    !hasAddress
                                                        ? ""
                                                        : `residente e domiciliado(a) à ${patient.address?.street}, ${patient.address?.number}, ${patient.address?.city}, ${patient.address?.state}, ${patient.address?.cep}`
                                                } esteve sob tratamento médico neste consultório no dia ${formatDateddMMyyyy(
                                                    certificateDate,
                                                )} às ${e.target.value}.`,
                                            );
                                        }}
                                        type="time"
                                    />
                                    {certificateHour?.length > 0 ? null : (
                                        <FormError message="A Hora de atendimento é obrigatório" />
                                    )}
                                </Flex>
                            </Flex>
                        </Box>
                    ) : null}
                    <Box width={{ base: "100%", md: "1000px" }}>
                        <Flex
                            flexDirection="column"
                            flexWrap="wrap"
                            width={{ base: "100%", md: "1000px" }}
                        >
                            {enableModal ? (
                                <PrescriptionCreatedModal
                                    signed={signed}
                                    buttonText=""
                                    isOpen={isOpenCreatedModal}
                                    onClose={onCloseCreatedModal}
                                    onOpen={onOpenCreatedModal}
                                    prescriptionId={Number(prescriptionId)}
                                    link={link}
                                    cellphone={patient.phoneNumber}
                                    email={patient.email}
                                />
                            ) : null}

                            {isCertified &&
                            certificateDate.length &&
                            certificateHour.length ? (
                                <FreeTextPrescription
                                    key={0}
                                    index={0}
                                    handleChange={(e: any) =>
                                        setCertificateOrientation(
                                            e.target.value,
                                        )
                                    }
                                    descriptionValue={certificateOrientation}
                                    descriptionId={`certificateOrientation`}
                                    removeFunction={
                                        removePrescriptionComposition
                                    }
                                    label="Orientação"
                                    placeholder="Orientação"
                                    showRemoveButton={false}
                                    textArea
                                    paddingTopTextArea="15px"
                                />
                            ) : null}

                            {isExamRequest
                                ? examList?.map(
                                      (
                                          exam: ICreatePrescriptionCompositionDto,
                                          index: number,
                                      ) => (
                                          <ExamSearch
                                              setExamList={setExamList}
                                              key={index}
                                              removeItem={removeExam}
                                              examList={examList}
                                              exam={exam}
                                              index={index}
                                          />
                                      ),
                                  )
                                : null}

                            {formik.values.map((component, index) => {
                                return returnDocumentComponent(
                                    component,
                                    index,
                                );
                            })}
                        </Flex>

                        {isExamRequest ? justificationField : null}

                        {documentId === DocumentTypeNameEnum.OTHERS ||
                        documentId === DocumentTypeNameEnum.EXAM_REQUEST ||
                        documentId === DocumentTypeNameEnum.PRESCRIPTION ? (
                            <ShouldShowDateOnPDF
                                setShowDateOnPDF={setShowDateOnPDF}
                                showDateOnPDF={showDateOnPDF}
                            />
                        ) : null}

                        {Number(account.councilId) === 2 ? (
                            <Box marginTop="15px">
                                <Text textAlign="center" color="#7D899D">
                                    Para identificação do animal clicar no botão
                                    texto livre
                                </Text>
                            </Box>
                        ) : null}

                        <Box backgroundColor="white" textAlign="center">
                            {documentId ? (
                                <Box
                                    backgroundColor="white.100"
                                    width="100%"
                                    height="50%"
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    paddingTop="15px"
                                    paddingBottom="15px"
                                    borderRadius="4px"
                                    boxShadow="md"
                                    marginTop="10px"
                                >
                                    <Text
                                        textAlign="center"
                                        fontWeight={900}
                                        color="blue.200"
                                        my="10px"
                                    >
                                        O que deseja adicionar?
                                    </Text>
                                    {(isEnable || isEnableWithoutSign) &&
                                    isPrescription ? (
                                        <SelectPrescriptionType
                                            setIsEnableWithoutSign={
                                                setIsEnableWithoutSign
                                            }
                                            setIsEnable={setIsEnable}
                                            isOpen={isOpenPrescriptionType}
                                            onClose={closePrescriptionType}
                                            onOpen={onOpenPrescriptionType}
                                            text=""
                                            setEnableModal={setEnableModal}
                                            setPrescriptionId={
                                                setPrescriptionId
                                            }
                                            doctorId={id}
                                            patient={patient}
                                            payload={payload}
                                            documentTypeId={
                                                documentTypeNameToId[
                                                    String(documentId)
                                                ]
                                            }
                                            onOpenCreatedModal={
                                                onOpenCreatedModal
                                            }
                                            signed={signed}
                                            setLink={setLink}
                                            showDateOnPDF={showDateOnPDF}
                                            setPatient={setPatient}
                                        />
                                    ) : null}

                                    <Flex
                                        height={{ base: "100px", md: "75px" }}
                                        flexDirection="row"
                                        flexWrap="wrap"
                                        justifyContent="center"
                                        width="100%"
                                        placeItems="center"
                                    >
                                        {isExamRequest ? (
                                            <Button
                                                width={"160px"}
                                                fontSize={14}
                                                text="Exame"
                                                textColor="black"
                                                variant="solid"
                                                type="button"
                                                bgColor="white.10"
                                                hasIcon={true}
                                                icon={
                                                    <i
                                                        className="ri-test-tube-line"
                                                        style={{
                                                            color: "red",
                                                        }}
                                                    ></i>
                                                }
                                                border="1px solid #EDEDF3;"
                                                fontWeight={500}
                                                onClick={addNewExam}
                                            />
                                        ) : null}

                                        {isPrescription ? (
                                            <Button
                                                width={"160px"}
                                                fontSize={14}
                                                text="Industrializado"
                                                textColor="black"
                                                variant="solid"
                                                type="button"
                                                bgColor="white.10"
                                                hasIcon={true}
                                                icon={
                                                    <i
                                                        className="ri-capsule-line"
                                                        style={{
                                                            color: "red",
                                                        }}
                                                    ></i>
                                                }
                                                border="1px solid #EDEDF3;"
                                                fontWeight={500}
                                                onClick={
                                                    addNewPrescriptionComposition
                                                }
                                            />
                                        ) : null}

                                        {documentId ? (
                                            <Button
                                                width={"160px"}
                                                fontSize={14}
                                                border="1px solid #EDEDF3;"
                                                type="button"
                                                text="Texto Livre"
                                                textColor="black"
                                                variant="solid"
                                                bgColor="white.10"
                                                hasIcon={true}
                                                icon={
                                                    <i
                                                        className="ri-text"
                                                        style={{ color: "red" }}
                                                    ></i>
                                                }
                                                fontWeight={500}
                                                onClick={addNewFreeText}
                                            />
                                        ) : null}

                                        <ListPrescriptionModel
                                            show
                                            documentTypeId={
                                                documentTypeNameToId[
                                                    String(documentId)
                                                ]
                                            }
                                            saveRawPrescription={
                                                saveRawPrescription
                                            }
                                            setModelToPrescription={
                                                setModelToPrescription
                                            }
                                            isEditPrescription={false}
                                            isFromMainPage={false}
                                        />
                                    </Flex>
                                    <CreatePrescriptionModel
                                        documentId={documentId}
                                        prescriptionComposition={formik.values}
                                        doctorId={String(
                                            localStorage.getItem(
                                                localStorageKeys.DOCTOR_ID,
                                            ),
                                        )}
                                        examList={examList}
                                        date={certificateDate}
                                        hour={certificateHour}
                                        certificateOrientation={
                                            certificateOrientation
                                        }
                                        content={content}
                                        title={title}
                                        justification={justification}
                                    />
                                </Box>
                            ) : null}

                            <Center
                                zIndex={99}
                                width="100%"
                                mt={{ base: "15px", md: "5px" }}
                            >
                                <Box width={{ base: "100%", md: "345px" }}>
                                    {documentId ? (
                                        <Button
                                            isLoading={isEnableWithoutSign}
                                            disable={isEnableWithoutSign}
                                            text={"Salvar e visualizar"}
                                            bgColor={"#FFFFFF"}
                                            textColor={"#D72A34"}
                                            fontSize={"15px"}
                                            onClick={() => setSigned(false)}
                                            hasIcon
                                            icon={
                                                <i
                                                    className="ri-printer-line"
                                                    style={{
                                                        color: "#D72A34",
                                                    }}
                                                ></i>
                                            }
                                            border="1px solid rgba(215, 42, 52, 0.2);"
                                            width="100%"
                                            height="47px"
                                            marginTop="15px"
                                        />
                                    ) : null}
                                </Box>
                            </Center>
                        </Box>
                    </Box>
                    <Flex
                        zIndex={99}
                        boxShadow="inset 0px 1px 0px #EDEDF3"
                        justifyContent="center"
                        marginBottom="0"
                        paddingX="15px"
                        paddingY="15px"
                        position="fixed"
                        bottom={0}
                        width="100%"
                        backgroundColor="white.10"
                    >
                        <Box zIndex={5} width={{ base: "100%", md: "345px" }}>
                            {documentId ? (
                                <Button
                                    isLoading={isEnable}
                                    disable={isEnable}
                                    fontSize={14}
                                    text="Salvar e assinar"
                                    bgColor="#D72A34"
                                    onClick={() => setSigned(true)}
                                    width="100%"
                                    height="47px"
                                    hasIcon
                                    textColor="#FFFFFF"
                                    icon={
                                        <i
                                            className="ri-pen-nib-line"
                                            style={{ color: "#FFFFFF" }}
                                        ></i>
                                    }
                                />
                            ) : null}
                        </Box>
                    </Flex>
                </Flex>
            </form>
        </>
    );
}
