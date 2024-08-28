/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Box, Center, Flex, Text, useDisclosure } from "@chakra-ui/react";
import { isCPF } from "brazilian-values";
import { useFormik } from "formik";
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useReducer,
    useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
    BoxTitle,
    Button,
    EditPatient,
    FormError,
    FreeTextPrescription,
    Header,
    IndustrializedPrescription,
    Input,
    PrescriptionCreatedModal,
} from "../../components";
import BackButton from "../../components/BackButton";
import { ExamSearch } from "../../components/examSearch";
import { ListPrescriptionModel } from "../../components/ListPrescriptionModel";
import { SelectPrescriptionType } from "../../components/SelectPrescriptionType";
import { ShouldShowDateOnPDF } from "../../components/ShouldShowDateOnPDF";
import { ToastMessage } from "../../components/ToastMessage";
import { IAddressOwnerAddressDto } from "../../interfaces/address/address.ownerAddress.dto";
import { IListPatient } from "../../interfaces/patient/create.patient.dto";
import {
    IPatientAddressDto,
    IPatientDto,
} from "../../interfaces/patient/patient.dto";
import { IPersonDto } from "../../interfaces/person/person.dto";
import { IPrescriptionCompositionDto } from "../../interfaces/prescription/prescription.composition.dto";
import { IPrescriptionDto } from "../../interfaces/prescription/prescription.dto";
import { IUpdatePrescriptionCompositionDto } from "../../interfaces/prescription/update.prescription.composition.dto";
import { ICreatePrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";
import {
    IPrescriptionCompositionModel,
    IPrescriptionModel,
} from "../../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { getDocStatus } from "../../services/getDocStatus";
import { getPatientById } from "../../services/getPatientById";
import { getPrescriptionById } from "../../services/getPrescriptionById";
import { signDocument } from "../../services/signDocument";
import { updatePrescription } from "../../services/updatePrescription";
import { updateSignDocument } from "../../services/updateSignDocument";
import { DocumentTypeEnum } from "../../utils/enum/document.type.enum";
import {
    DocumentNameParser,
    DocumentTypeNameEnum,
} from "../../utils/enum/Document.type.name.enum";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import {
    PrescriptionTypeEnum,
    PrescriptionTypeIdToNameEnum,
} from "../../utils/enum/prescription.type.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { formatExtendedDate } from "../../utils/formatExtendedDate";
import {
    verifyIsEmpty,
    verifyIsEmptyFreeText,
    verifyIsFreeText,
} from "../../utils/verifyIsText";

const emptyPC: ICreatePrescriptionCompositionDto = {
    activePrinciple: "",
    description: "",
    dosage: "",
    medicine: "",
    packing: "",
    isOrientation: false,
    isContent: false,
    isTitle: false,
    isJustification: false,
    examId: 0,
    medicineId: 0,
    quantity: 0,
};

const emptyFreeText: ICreatePrescriptionCompositionDto = {
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
};

export function EditPrescription() {
    const navigate = useNavigate();
    const [signed, setSigned] = useState<boolean>(false);
    const [enableModal, setEnableModal] = useState<boolean>(false);
    const [isEnable, setIsEnable] = useState<boolean>(false);
    const [isEnableWithoutSign, setIsEnableWithoutSign] =
        useState<boolean>(false);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [indexOfFreeText, setIndexOfFreeText] = useState<boolean[]>([]);
    const [certificateHour, setCertificateHour] = useState("");
    const [certificateDate, setCertificateDate] = useState("");
    const [certificateOrientation, setCertificateOrientation] =
        useState<IPrescriptionCompositionDto>();
    const [payload, setPayload] =
        useState<ICreatePrescriptionCompositionDto[]>();
    const [justification, setJustification] =
        useState<IPrescriptionCompositionDto>();
    const [examList, setExamList] = useState<
        IPrescriptionCompositionDto[] | ICreatePrescriptionCompositionDto[]
    >([]);
    const [doctorId, setDoctorId] = useState<number>();
    const [patient, setPatient] = useState<IPatientDto>();
    const [title, setTitle] = useState<IPrescriptionCompositionDto>();
    const [content, setContent] = useState<IPrescriptionCompositionDto>();
    const [prescription, setPrescription] = useState<IPrescriptionDto>();
    const [showDateOnPDF, setShowDateOnPDF] = useState(true);
    const [link, setLink] = useState("");
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

    const { prescriptionId } = useParams();

    const isCertified =
        DocumentNameParser[Number(prescription?.documentTypeId)] ===
        DocumentTypeNameEnum.CERTIFICATE;

    const isOthers =
        DocumentNameParser[Number(prescription?.documentTypeId)] ===
        DocumentTypeNameEnum.OTHERS;

    const isExamRequest =
        DocumentNameParser[Number(prescription?.documentTypeId)] ===
        DocumentTypeNameEnum.EXAM_REQUEST;

    const isPrescription =
        DocumentNameParser[Number(prescription?.documentTypeId)] ===
        DocumentTypeNameEnum.PRESCRIPTION;

    async function getDoctorName() {
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );

        setDoctorId(Number(docId));
    }

    function formReset() {
        setCertificateDate("");
        setCertificateHour("");
        setCertificateOrientation(undefined);
        setContent(undefined);
        setTitle(undefined);
        setIndexOfFreeText([]);

        formik.resetForm();
    }

    async function saveRawPrescription() {
        const obj = {
            formikValues: formik.values,
            documentId: prescription?.documentTypeId,
            certificateHour,
            certificateDate,
            certificateOrientation,
            justification,
            indexOfFreeText,
            title,
            content,
            examList,
        };
        await asyncLocalStorage.setItem(
            localStorageKeys.TEMP_DOCUMENT,
            JSON.stringify(obj),
        );
    }

    async function getInfo() {
        const prescriptionResult = await getPrescriptionById(
            Number(prescriptionId),
        );

        const isCertified =
            DocumentNameParser[Number(prescriptionResult?.documentTypeId)] ===
            DocumentTypeNameEnum.CERTIFICATE;

        if (isCertified) {
            setCertificateDate(String(prescriptionResult.date) as any);
            setCertificateHour(String(prescriptionResult.hour));
        }

        prescriptionResult.prescriptionCompositons.forEach(
            (pc: IPrescriptionCompositionDto) => {
                if (pc.isOrientation) {
                    setCertificateOrientation(pc);
                }
                if (pc.isContent) {
                    setContent(pc);
                }
                if (pc.isTitle) {
                    setTitle(pc);
                }
                if (pc.isJustification) {
                    setJustification(pc);
                }
                if (pc.examId > 0) {
                    const aux = examList;
                    aux.push(pc);
                    setExamList(aux);
                }
            },
        );
        const result = await getPatientById(prescriptionResult.patientId);
        const normalCompositions =
            prescriptionResult.prescriptionCompositons.filter(
                (pc) =>
                    !pc.isOrientation &&
                    !pc.isContent &&
                    !pc.isTitle &&
                    !pc.isJustification &&
                    !pc.examId,
            );
        await formik.setValues(normalCompositions);
        formik.values = normalCompositions;

        setPrescription(prescriptionResult);
        setShowDateOnPDF(!!prescriptionResult?.shouldShowDate);
        setPatient(result);
        forceUpdate();
    }

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
            active: true,
            prescriptionId: 0,
            id: 0,
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
        const index = formik.values.length - 1;
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

    function returnDocumentComponent(
        component: ICreatePrescriptionCompositionDto,
        index: number,
    ) {
        if (verifyIsEmptyFreeText(component) || verifyIsFreeText(component)) {
            indexOfFreeText[index] = true;
        }

        if (typeof component === "object" && component !== null) {
            if (
                indexOfFreeText[index] &&
                !component.medicineId &&
                component.dosage === null
            ) {
                return (
                    <FreeTextPrescription
                        key={index}
                        index={index}
                        handleChange={formik.handleChange}
                        descriptionValue={String(
                            formik.values[index]?.description,
                        )}
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
                        quantityValue={formik.values[index].quantity}
                    />
                );
            }
        }
    }

    async function setModelToPrescription(
        prescriptionModel: IPrescriptionModel,
    ): Promise<void> {
        if (prescriptionModel.date && prescriptionModel.hour) {
            setCertificateDate(prescriptionModel.date);
            setCertificateHour(prescriptionModel.hour);
        }
        setExamList([]);
        let removeFirst = false;
        prescriptionModel.prescriptionCompositonsModels.forEach(
            (pcm: IPrescriptionCompositionModel) => {
                if (pcm.isContent) {
                    setContent({
                        ...pcm,
                        id: Number(content?.id),
                        prescriptionId: Number(content?.prescriptionId),
                    });
                }
                if (pcm.isJustification) {
                    setJustification({
                        ...pcm,
                        id: Number(justification?.id),
                        prescriptionId: Number(justification?.prescriptionId),
                    });
                }
                if (pcm.isOrientation) {
                    setCertificateOrientation({
                        ...pcm,
                        id: Number(certificateOrientation?.id),
                        prescriptionId: Number(
                            certificateOrientation?.prescriptionId,
                        ),
                    });
                }
                if (pcm.isTitle) {
                    setTitle({
                        ...pcm,
                        id: Number(certificateOrientation?.id),
                        prescriptionId: Number(
                            certificateOrientation?.prescriptionId,
                        ),
                    });
                }
                if (pcm.examId > 0) {
                    if (!removeFirst) {
                        removeFirst = true;
                    }
                    const aux = examList;
                    aux.push({
                        ...pcm,
                        id: Number(pcm?.id),
                        prescriptionId: Number(prescriptionId),
                    });
                    setExamList(aux);
                }
            },
        );

        if (removeFirst && examList[0]?.examId === 0) {
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
                    prescriptionId: Number(prescriptionId),
                };
            },
        );
        const mergedArray = [...formik.values, ...normalCompositionsFormated];

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

    const validationSchema = Yup.object().shape({
        activePrinciple: Yup.string().required("O campo é obrigatório."),
        description: Yup.string().required("O campo é obrigatório."),
        dosage: Yup.string().required("O campo é obrigatório."),
        medicine: Yup.string().required("O campo é obrigatório."),
        packing: Yup.string().required("O campo é obrigatório."),
    });

    function resetButtons() {
        setIsEnableWithoutSign(false);
        setIsEnable(false);
    }

    const formik = useFormik({
        initialValues: [] as any[],
        validationSchema,
        onSubmit: async (values: IPrescriptionCompositionDto[]) => {
            let hasEmptyAddressInfo = false;
            const hasAddress = Boolean(patient?.address?.cep);

            for (const prop of Object.keys(
                patient?.address as IPatientAddressDto,
            )) {
                if (!patient?.address[prop]) {
                    hasEmptyAddressInfo = true;
                }
            }
            const shouldShowError =
                hasEmptyAddressInfo &&
                !hasAddress &&
                [
                    PrescriptionTypeEnum.CONTROLLED_RECIPE,
                    PrescriptionTypeEnum.ANTIMICROBIAL_PRESCRIPTION,
                ].includes(Number(prescription?.idPrescriptionType));

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
                return;
            }
            const isDocRequiredCPF = [
                PrescriptionTypeEnum.CONTROLLED_RECIPE,
                PrescriptionTypeEnum.ANTIMICROBIAL_PRESCRIPTION,
            ].includes(Number(prescription?.idPrescriptionType));
            const cpfError =
                (patient?.hasResponsible && !isCPF(patient.responsibleCPF)) ||
                (!patient?.hasResponsible && !isCPF(String(patient?.cpf)));
            if (cpfError && isDocRequiredCPF) {
                toast.error(
                    <ToastMessage
                        title="Erro"
                        description="O CPF é obrigatório!"
                    />,
                );
                if (
                    typeof setIsEnableWithoutSign === "function" &&
                    typeof setIsEnable === "function"
                ) {
                    setIsEnableWithoutSign(false);
                    setIsEnable(false);
                }

                return;
            }

            if (signed) {
                setIsEnableWithoutSign(false);
                setIsEnable(true);
            } else {
                setIsEnableWithoutSign(true);
                setIsEnable(false);
            }

            setPayload(values);

            try {
                if (isPrescription) {
                    const unregularIndustrializedComposotion = values.filter(
                        (pc: ICreatePrescriptionCompositionDto) =>
                            (!pc?.medicineId && !pc?.dosage) ||
                            (pc?.medicineId && !pc?.dosage) ||
                            (!pc?.medicineId && pc?.dosage),
                    );

                    if (!unregularIndustrializedComposotion) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="Todos os industrializados devem conter um texto de posologia!"
                            />,
                        );
                        return;
                    }
                }
                const compositions = values?.filter(
                    (composition) =>
                        composition !== undefined &&
                        typeof composition !== "string" &&
                        !verifyIsEmpty(composition),
                );

                if (isCertified) {
                    compositions.push(
                        certificateOrientation as unknown as IPrescriptionCompositionDto,
                    );
                }

                if (isOthers) {
                    compositions.push(
                        title as unknown as IPrescriptionCompositionDto,
                    );
                    compositions.push(
                        content as unknown as IPrescriptionCompositionDto,
                    );
                }

                if (isExamRequest) {
                    if (examList.length > 0) {
                        const emptyExams = [];
                        examList.forEach((exam: any) => {
                            if (exam.examId === 0) emptyExams.push(exam);
                        });

                        if (emptyExams.length) {
                            resetButtons();
                            toast.error(
                                <ToastMessage
                                    title="Erro"
                                    description="Todos os exames devem ser preenchidos"
                                />,
                            );
                            return;
                        }
                    }

                    if (justification !== undefined && justification !== null) {
                        compositions.push(
                            justification as unknown as IPrescriptionCompositionDto,
                        );
                    }
                    if (examList.length > 0) {
                        examList.forEach((newPc: any) => {
                            compositions.forEach((olderPC) => {
                                if (newPc?.id === olderPC?.id) {
                                    olderPC.examId = newPc.examId;
                                }
                            });
                            compositions.push(newPc);
                        });
                    }
                }

                const addressAsString = await asyncLocalStorage.getItem(
                    localStorageKeys.ADDRESS,
                );
                const address: IAddressOwnerAddressDto = JSON.parse(
                    String(addressAsString),
                );
                if (compositions.length === 0) {
                    toast.error(
                        <ToastMessage
                            title="Erro"
                            description="Você não pode salvar um documento vazio"
                        />,
                    );
                    return;
                }

                const result = await updatePrescription({
                    active: !!prescription?.active,
                    assigned: false,
                    date: String(certificateDate),
                    doctorId: Number(prescription?.doctorId),
                    documentTypeId: Number(prescription?.documentTypeId),
                    hour: certificateHour,
                    idPrescriptionType: Number(
                        prescription?.idPrescriptionType,
                    ),
                    patientId: Number(prescription?.patientId),
                    person: [prescription?.person as IPersonDto],
                    prescriptionComposition:
                        compositions as IUpdatePrescriptionCompositionDto[],
                    prescriptionId: Number(prescriptionId),
                    ownerAddressId: address.ownerAddressId,
                    updateDate: new Date(String(prescription?.updateDate)),
                    shouldShowDate: showDateOnPDF,
                });

                if (
                    signed &&
                    !isCPF(String(patient?.cpf)) &&
                    !patient?.hasResponsible
                ) {
                    setIsEnable(false);

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

                    const data = await signDocument(
                        Number(prescription?.id),
                        false,
                    );
                    const aba = window.open(
                        data?.signature?.url,
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
                    }

                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    const timer = setInterval(async function () {
                        try {
                            if (aba?.closed) {
                                await updateSignDocument(
                                    Number(prescription?.id),
                                    false,
                                );
                                clearInterval(timer);
                                setIsEnable(false);
                                setEnableModal(true);
                                onOpenCreatedModal();
                                const docId = await asyncLocalStorage.getItem(
                                    localStorageKeys.DOCTOR_ID,
                                );
                                navigate(`/showPrescriptions/${docId}`);
                                toast.warning(
                                    <ToastMessage
                                        title="Atenção!"
                                        description="Não foi possível assinar o documento!"
                                    />,
                                );

                                return;
                            }

                            const status = await getDocStatus(
                                data?.signature?.idDocument,
                            );

                            if (status?.status === "F") {
                                clearInterval(timer);
                                aba?.close();
                                setLink(result?.whatsLink);
                                setPrescription(prescription);
                                setEnableModal(true);
                                onOpenCreatedModal();
                                formReset();
                                toast.success(
                                    <ToastMessage
                                        title="Documento assinado"
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
                    setLink(result?.whatsLink);
                    setPrescription(prescription);
                    formReset();
                    setEnableModal(true);
                    toast.success("Documento atualizado com sucesso!");
                    onOpenCreatedModal();
                }
            } catch (error) {
                console.log(error);
                setIsEnableWithoutSign(false);
                toast.error(
                    <ToastMessage
                        title="Erro"
                        description="Erro ao atualizar documento"
                    />,
                );
            }
        },
    });

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
                    placeholder="Conteúdo"
                    value={justification?.description}
                    onChange={(e: any) => {
                        const value: IPrescriptionCompositionDto = {
                            activePrinciple: justification?.activePrinciple
                                ? justification?.activePrinciple
                                : "",
                            dosage: justification?.dosage
                                ? justification?.dosage
                                : "",

                            isOrientation: !!justification?.isOrientation,
                            medicine: justification?.medicine
                                ? justification?.medicine
                                : "",

                            packing: justification?.packing
                                ? justification?.packing
                                : "",

                            description: e.target.value,
                            createDate: justification?.createDate,

                            active: !!justification?.active,
                            id: Number(justification?.id),
                            prescriptionId: Number(
                                justification?.prescriptionId,
                            ),
                            updateDate: justification?.updateDate,
                            isContent: !!justification?.isContent,
                            isTitle: !!justification?.isTitle,
                            isJustification: true,
                            examId: Number(justification?.examId),
                            medicineId: Number(justification?.examId),
                            quantity: Number(justification?.quantity),
                        };
                        setJustification(value);
                    }}
                />
            </Box>
        </>
    );

    useEffect(() => {
        void getDoctorName();
    }, []);

    useEffect(() => {
        if (doctorId) {
            void getInfo();
        }
    }, [doctorId]);

    return (
        <>
            <Header id={Number(doctorId)} />
            <form onSubmit={formik.handleSubmit}>
                <Box
                    className="pageBody"
                    width={{ base: "100%", md: "1000px" }}
                    margin="auto"
                    paddingBottom="100px"
                >
                    <Flex marginTop="10px">
                        <BackButton />
                    </Flex>

                    <Flex
                        flexDirection="row"
                        flexWrap="nowrap"
                        justifyContent={{
                            base: "space-around",
                            md: "space-between",
                        }}
                        alignItems="center"
                        my={5}
                        width="100%"
                    >
                        <Box>
                            <Text fontWeight={800}>Editar Documento</Text>
                            <Text fontWeight={500}>
                                {prescription?.documentTypeId ===
                                DocumentTypeEnum.Receita
                                    ? `${
                                          PrescriptionTypeIdToNameEnum[
                                              Number(
                                                  prescription?.idPrescriptionType,
                                              )
                                          ]
                                      }`
                                    : DocumentNameParser[
                                          Number(prescription?.documentTypeId)
                                      ]}
                            </Text>
                        </Box>
                        <Box>
                            <Text
                                color="#3E4C62"
                                fontWeight={500}
                                fontSize={12}
                            >
                                {formatExtendedDate(new Date())}
                            </Text>
                        </Box>
                    </Flex>
                    <Box
                        marginBottom="15px"
                        paddingLeft={{ base: "15px", md: 0 }}
                    >
                        <EditPatient
                            isMenuList={false}
                            patient={patient as IListPatient}
                            setPatient={
                                setPatient as Dispatch<
                                    SetStateAction<IListPatient | undefined>
                                >
                            }
                        />
                    </Box>
                    <Flex
                        flexDirection="row"
                        flexWrap="wrap"
                        justifyContent="center"
                        alignItems="center"
                        width={{ base: "100%", md: "1000px" }}
                        placeItems="center"
                    >
                        {isOthers ? (
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
                                        onChange={(e: any) => {
                                            const value: IPrescriptionCompositionDto =
                                                {
                                                    activePrinciple:
                                                        title?.activePrinciple
                                                            ? title?.activePrinciple
                                                            : "",
                                                    dosage: title?.dosage
                                                        ? title?.dosage
                                                        : "",

                                                    isOrientation:
                                                        !!title?.isOrientation,
                                                    medicine: title?.medicine
                                                        ? title?.medicine
                                                        : "",

                                                    packing: title?.packing
                                                        ? title?.packing
                                                        : "",

                                                    description: e.target.value,
                                                    createDate:
                                                        title?.createDate,

                                                    active: !!title?.active,
                                                    id: Number(title?.id),
                                                    prescriptionId: Number(
                                                        title?.prescriptionId,
                                                    ),
                                                    updateDate:
                                                        title?.updateDate,
                                                    isContent:
                                                        !!title?.isContent,
                                                    isTitle: !!title?.isTitle,
                                                    isJustification:
                                                        !!title?.isJustification,
                                                    examId: Number(
                                                        title?.examId,
                                                    ),
                                                    medicineId: Number(
                                                        title?.medicineId,
                                                    ),
                                                    quantity: Number(
                                                        title?.quantity,
                                                    ),
                                                };
                                            setTitle(value);
                                        }}
                                        value={String(title?.description)}
                                        id={`title`}
                                        placeholder="Titulo"
                                        required
                                    />
                                    <Input
                                        onChange={(e: any) => {
                                            const value: IPrescriptionCompositionDto =
                                                {
                                                    activePrinciple:
                                                        content?.activePrinciple
                                                            ? content?.activePrinciple
                                                            : "",
                                                    dosage: content?.dosage
                                                        ? content?.dosage
                                                        : "",

                                                    isOrientation:
                                                        !!content?.isOrientation,
                                                    medicine: content?.medicine
                                                        ? content?.medicine
                                                        : "",

                                                    packing: content?.packing
                                                        ? content?.packing
                                                        : "",

                                                    description: e.target.value,
                                                    createDate:
                                                        content?.createDate,

                                                    active: !!content?.active,
                                                    id: Number(content?.id),
                                                    prescriptionId: Number(
                                                        content?.prescriptionId,
                                                    ),
                                                    updateDate:
                                                        content?.updateDate,
                                                    isContent:
                                                        !!content?.isContent,
                                                    isTitle: !!content?.isTitle,
                                                    isJustification:
                                                        !!content?.isJustification,
                                                    examId: Number(
                                                        content?.examId,
                                                    ),
                                                    medicineId: Number(
                                                        content?.medicineId,
                                                    ),
                                                    quantity: Number(
                                                        content?.quantity,
                                                    ),
                                                };
                                            setContent(value);
                                        }}
                                        value={String(content?.description)}
                                        id={`content`}
                                        placeholder="Conteúdo"
                                        required
                                        textArea
                                        paddingTopTextArea="15px"
                                    />
                                </Box>
                            </>
                        ) : null}
                        {isCertified ? (
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100%"
                                marginBottom="20px"
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
                                            required
                                            min={6}
                                            placeholder="Data"
                                            width={{ base: "100%", md: "98%" }}
                                            type="date"
                                            value={certificateDate}
                                            onChange={(e: any) =>
                                                setCertificateDate(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {certificateDate.length > 0 ? null : (
                                            <FormError message="A Data de atendimento é obrigatório" />
                                        )}
                                    </Flex>
                                    <Flex flexDirection="column" width="100%">
                                        <Input
                                            required
                                            placeholder="Hora"
                                            width="100%"
                                            value={certificateHour}
                                            onChange={(e: any) =>
                                                setCertificateHour(
                                                    e.target.value,
                                                )
                                            }
                                            type="time"
                                        />
                                        {certificateHour.length > 0 ? null : (
                                            <FormError message="A Hora de atendimento é obrigatório" />
                                        )}
                                    </Flex>
                                </Flex>
                            </Box>
                        ) : null}
                        {isCertified ? (
                            <FreeTextPrescription
                                key={0}
                                index={0}
                                handleChange={(e: any) => {
                                    const value: IPrescriptionCompositionDto = {
                                        activePrinciple:
                                            certificateOrientation?.activePrinciple
                                                ? certificateOrientation?.activePrinciple
                                                : "",
                                        dosage: certificateOrientation?.dosage
                                            ? certificateOrientation?.dosage
                                            : "",

                                        isOrientation:
                                            !!certificateOrientation?.isOrientation,
                                        medicine:
                                            certificateOrientation?.medicine
                                                ? certificateOrientation?.medicine
                                                : "",

                                        packing: certificateOrientation?.packing
                                            ? certificateOrientation?.packing
                                            : "",

                                        description: e.target.value,
                                        createDate:
                                            certificateOrientation?.createDate,

                                        active: !!certificateOrientation?.active,
                                        id: Number(certificateOrientation?.id),
                                        prescriptionId: Number(
                                            certificateOrientation?.prescriptionId,
                                        ),
                                        updateDate:
                                            certificateOrientation?.updateDate,
                                        isContent:
                                            !!certificateOrientation?.isContent,
                                        isTitle:
                                            !!certificateOrientation?.isTitle,
                                        isJustification:
                                            !!certificateOrientation?.isJustification,
                                        examId: Number(
                                            certificateOrientation?.examId,
                                        ),
                                        medicineId: Number(
                                            certificateOrientation?.medicineId,
                                        ),
                                        quantity: Number(
                                            certificateOrientation?.quantity,
                                        ),
                                    };
                                    setCertificateOrientation(value);
                                }}
                                descriptionValue={String(
                                    certificateOrientation?.description,
                                )}
                                descriptionId={`certificateOrientation`}
                                removeFunction={removePrescriptionComposition}
                                label="Orientação"
                                placeholder="Orientação"
                                showRemoveButton={false}
                                textArea
                                paddingTopTextArea="15px"
                            />
                        ) : null}

                        {isExamRequest
                            ? examList.map(
                                  (
                                      exam:
                                          | ICreatePrescriptionCompositionDto
                                          | IPrescriptionCompositionDto,
                                      index: number,
                                  ) => (
                                      <ExamSearch
                                          exam={exam}
                                          setExamList={setExamList}
                                          removeItem={removeExam}
                                          examList={examList}
                                          index={index}
                                          key={index}
                                      />
                                  ),
                              )
                            : null}

                        {isExamRequest ? justificationField : null}
                    </Flex>
                    {formik.values?.map((component, index) => {
                        return returnDocumentComponent(component, index);
                    })}

                    <ShouldShowDateOnPDF
                        setShowDateOnPDF={setShowDateOnPDF}
                        showDateOnPDF={showDateOnPDF}
                    />

                    <Box backgroundColor="white" textAlign="center">
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
                            <SelectPrescriptionType
                                isOpen={isOpenPrescriptionType}
                                onClose={onClosePrescriptionType}
                                onOpen={onOpenPrescriptionType}
                                text=""
                                setEnableModal={setEnableModal}
                                setPrescriptionId={() => {}}
                                doctorId={doctorId}
                                patient={patient as IListPatient}
                                payload={payload}
                                documentTypeId={Number(
                                    prescription?.documentTypeId,
                                )}
                                setLink={setLink}
                                onOpenCreatedModal={onOpenCreatedModal}
                                signed={signed}
                                showDateOnPDF={showDateOnPDF}
                            />
                            {enableModal ? (
                                <PrescriptionCreatedModal
                                    buttonText=""
                                    isOpen={isOpenCreatedModal}
                                    onClose={onCloseCreatedModal}
                                    onOpen={onOpenCreatedModal}
                                    prescriptionId={Number(prescription?.id)}
                                    signed={signed}
                                    link={link}
                                    cellphone={String(patient?.phoneNumber)}
                                    email={String(patient?.email)}
                                />
                            ) : null}
                            <Flex
                                height={{ base: "100px", md: "60px" }}
                                flexDirection="row"
                                flexWrap="wrap"
                                justifyContent="center"
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
                                        width="160px"
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
                                        onClick={addNewPrescriptionComposition}
                                    />
                                ) : null}

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
                                <ListPrescriptionModel
                                    show
                                    saveRawPrescription={saveRawPrescription}
                                    documentTypeId={Number(
                                        prescription?.documentTypeId,
                                    )}
                                    setModelToPrescription={
                                        setModelToPrescription
                                    }
                                    isEditPrescription
                                    documentId={Number(prescriptionId)}
                                />
                            </Flex>
                        </Box>
                        <Center
                            zIndex={99}
                            width="100%"
                            mt={{ base: "15px", md: "5px" }}
                        >
                            <Box width={{ base: "100%", md: "345px" }}>
                                {DocumentNameParser[
                                    Number(prescription?.documentTypeId)
                                ] ? (
                                    <Button
                                        isLoading={isEnableWithoutSign}
                                        disable={isEnableWithoutSign}
                                        text={"Salvar sem assinar"}
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
                    </Box>
                </Flex>
            </form>
        </>
    );
}
