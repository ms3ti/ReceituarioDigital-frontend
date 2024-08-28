import { Box, Center, Flex, Text, useDisclosure } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useAccount } from "../../contexts/accountContext";
import { ICreatePrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";
import {
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

import { createEmergencyDoc } from "../../services/createEmergencyDoc";
import { PrescriptionTypeEnum } from "../../utils/enum/prescription.type.enum";
import { formatDateddMMyyyy } from "../../utils/formatDateddMMyyyy";
import { FormError } from "../FormError";
import { FreeTextPrescription } from "../FreeTextPrescription";
import { IndustrializedPrescription } from "../IndustrializedPrescription";
import { Input } from "../Input";
import { PrescriptionCreatedModal } from "../PrescriptionCreatedModal";
import { Select } from "../Select";
import { ToastMessage } from "../ToastMessage";
import { ExamSearch } from "../examSearch";

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

export function CreateEmergencyDoc() {
    const account = useAccount();
    const navigate = useNavigate();

    const [prescriptionId] = useState<number>();
    const [signed, setSigned] = useState<boolean>(false);
    const [, setIsEnable] = useState<boolean>(false);
    const [isEnableWithoutSign, setIsEnableWithoutSign] =
        useState<boolean>(false);
    const [enableModal] = useState<boolean>(false);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [indexOfFreeText, setIndexOfFreeText] = useState<boolean[]>([]);
    const [patientName, setPatientName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [id, setId] = useState<number>();
    const [, setPayload] = useState<ICreatePrescriptionCompositionDto[]>();
    const [documentId, setDocumentId] = useState("");
    const [certificateHour, setCertificateHour] = useState("");
    const [certificateDate, setCertificateDate] = useState("");

    const [certificateOrientation, setCertificateOrientation] = useState(
        `Atesto para devidos fins que ${patientName}, esteve sob tratamento médico neste consultório no dia ${certificateDate} às ${certificateHour}.`,
    );
    const [justification, setJustification] = useState("");
    const [isFormValid, setIsFormValid] = useState(true);
    const [link] = useState("");
    const [showDateOnPDF] = useState(true);
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

    const isCertified = documentId === DocumentTypeNameEnum.CERTIFICATE;

    const isOthers = documentId === DocumentTypeNameEnum.OTHERS;

    const isExamRequest = documentId === DocumentTypeNameEnum.EXAM_REQUEST;

    const isPrescription = documentId === DocumentTypeNameEnum.PRESCRIPTION;

    async function getDoctorId() {
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        setId(Number(docId));
    }

    const validationSchema = Yup.object().shape({
        activePrinciple: Yup.string().required("O campo é obrigatório."),
        description: Yup.string().required("O campo é obrigatório."),
        dosage: Yup.string().required("O campo é obrigatório."),
        medicine: Yup.string().required("O campo é obrigatório."),
        packing: Yup.string().required("O campo é obrigatório."),
        patientName: Yup.string().required("O campo é obrigatório."),
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
            setIsLoading(true);

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
                setIsLoading(false);
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
                    return;
                }

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

                const unregularIndustrializedComposotion = compositions.filter(
                    (pc: ICreatePrescriptionCompositionDto) =>
                        (pc?.medicineId && !pc?.dosage) ||
                        (!pc?.medicineId && pc?.dosage),
                );

                if (unregularIndustrializedComposotion.length > 0) {
                    setIsLoading(false);
                    toast.error(
                        <ToastMessage
                            title="Erro"
                            description="Todos os industrializados devem conter um texto de posologia e um medicamento!"
                        />,
                    );
                    return;
                }

                const payloads: any = {
                    prescription: {
                        person: {
                            name: patientName,
                        },
                        documentTypeId:
                            documentTypeNameToId[String(documentId)],
                        prescriptionCompositons:
                            compositions as unknown as ICreatePrescriptionCompositionDto[],
                        date: certificateDate,
                        hour: certificateHour,
                        shouldShowDate: showDateOnPDF,
                        idPrescriptionType: isPrescription
                            ? PrescriptionTypeEnum.PRESCRIPTION
                            : undefined,
                    },
                };

                const data = await createEmergencyDoc(payloads, String(id));

                let pdf = "";
                pdf = data?.buffer;

                const linkSource = `data:application/pdf;base64,${String(pdf)}`;
                const downloadLink = document.createElement("a");

                const fileName = `${String(data?.fileName)}.pdf`;
                downloadLink.target = "__blank";
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();

                toast.success(
                    <ToastMessage
                        title="Sucesso!"
                        description="Documento criado com sucesso!"
                    />,
                );

                setIsLoading(false);
                setTimeout(() => {
                    navigate(`/showPrescriptions/${id}`);
                }, 3000);

                return;
            }

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
                const validExams = examList.filter((exam) => exam.examId !== 0);
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

                const payloads: any = {
                    prescription: {
                        person: {
                            name: patientName,
                        },
                        documentTypeId:
                            documentTypeNameToId[String(documentId)],
                        prescriptionCompositons:
                            onlyValidCompositions as unknown as ICreatePrescriptionCompositionDto[],
                        date: certificateDate,
                        hour: certificateHour,
                        shouldShowDate: showDateOnPDF,
                    },
                };

                const data = await createEmergencyDoc(payloads, String(id));

                let pdf = "";
                pdf = data?.buffer;

                const linkSource = `data:application/pdf;base64,${String(pdf)}`;
                const downloadLink = document.createElement("a");

                const fileName = `${String(data?.fileName)}.pdf`;
                downloadLink.target = "__blank";
                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();

                toast.success(
                    <ToastMessage
                        title="Sucesso!"
                        description="Documento criado com sucesso!"
                    />,
                );

                setIsLoading(false);
                setTimeout(() => {
                    navigate(`/showPrescriptions/${id}`);
                }, 3000);
            } catch (error) {
                console.log(error);
                setIsLoading(false);
                setIsEnableWithoutSign(false);
                setIsEnable(false);
                toast.error(
                    <ToastMessage
                        title="Erro"
                        description="Erro ao criar documento"
                    />,
                );
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
        forceUpdate();
    }, []);

    useEffect(() => {
        setCertificateOrientation(
            `Atesto para devidos fins que ${patientName}, esteve sob tratamento médico neste consultório no dia ${formatDateddMMyyyy(
                certificateDate,
            )} às ${certificateHour}.`,
        );
    }, [patientName]);

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
                        <Text as="b"><Text as="u">Atenção Prescritor</Text></Text>
                        <Text color="gray.600">
                            - Essa tela deve ser usada em situações especiais e
                            /ou emergência, apenas na falta do CPF do paciente.
                        </Text>
                        <Text color="gray.600">
                            - A prescrição não será salva e não haverá histórico
                            deste documento.
                        </Text>
                    </Box>

                    <Box
                        backgroundColor={"#F7F8FA"}
                        padding="15px"
                        width={{ base: "100%", md: "1000px" }}
                        marginBottom="20px"
                        borderRadius="4px"
                        boxShadow="md"
                    >
                        <BoxTitle text="Nome" />
                        <Input
                            required
                            placeholder="Nome"
                            value={patientName}
                            onChange={(e: any) =>
                                setPatientName(e.target.value)
                            }
                        />
                        {patientName.length ? null : (
                            <FormError message="Informe o nome completo" />
                        )}
                    </Box>

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
                                            setCertificateDate(e.target.value);
                                            setCertificateOrientation(
                                                `Atesto para devidos fins que ${patientName}, esteve sob tratamento médico neste consultório no dia ${formatDateddMMyyyy(
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
                                            setCertificateHour(e.target.value);
                                            setCertificateOrientation(
                                                `Atesto para devidos fins que ${patientName}, esteve sob tratamento médico neste consultório no dia ${formatDateddMMyyyy(
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
                                    cellphone={""}
                                    email={""}
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
                                    </Flex>
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
                                            isLoading={
                                                isLoading || isEnableWithoutSign
                                            }
                                            disable={
                                                isLoading || isEnableWithoutSign
                                            }
                                            text={"Baixar PDF"}
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
                </Flex>
            </form>
        </>
    );
}
