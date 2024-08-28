import { Box, Flex, Text } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useReducer, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    BoxTitle,
    Button,
    FormError,
    FreeTextPrescription,
    Header,
    IndustrializedPrescription,
    Input,
} from "../../components";
import { ICreatePrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";
import {
    DocumentNameParser,
    DocumentTypeNameEnum,
} from "../../utils/enum/Document.type.name.enum";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import * as Yup from "yup";
import { ToastMessage } from "../../components/ToastMessage";
import {
    verifyIsEmptyFreeText,
    verifyIsFreeText,
} from "../../utils/verifyIsText";
import { getPrescriptionModelById } from "../../services/getPrescriptionModelById";
import {
    IPrescriptionCompositionModel,
    IPrescriptionModel,
} from "../../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { updatePrescriptionModel } from "../../services/updatePrescriptionModel";
import { ExamSearchModel } from "../../components/examSearchModel";
import BackButton from "../../components/BackButton/index";

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
    quantity: 1,
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

export function EditPrescriptionModel() {
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [indexOfFreeText, setIndexOfFreeText] = useState<boolean[]>([]);
    const [certificateHour, setCertificateHour] = useState("");
    const [certificateDate, setCertificateDate] = useState("");
    const [certificateOrientation, setCertificateOrientation] =
        useState<IPrescriptionCompositionModel>();
    const [doctorId, setDoctorId] = useState<number>();
    const [title, setTitle] = useState<IPrescriptionCompositionModel>();
    const [content, setContent] = useState<IPrescriptionCompositionModel>();
    const [justification, setJustification] =
        useState<IPrescriptionCompositionModel>();
    const [prescriptionModel, setPrescriptionModel] =
        useState<IPrescriptionModel>();
    const [examList, setExamList] = useState<
        IPrescriptionCompositionModel[] | ICreatePrescriptionCompositionDto[]
    >([]);
    const { prescriptionModelId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isCertificate =
        DocumentNameParser[Number(prescriptionModel?.documentTypeId)] ===
        DocumentTypeNameEnum.CERTIFICATE;

    const isPrescription =
        DocumentNameParser[Number(prescriptionModel?.documentTypeId)] ===
        DocumentTypeNameEnum.PRESCRIPTION;

    const isOthers =
        DocumentNameParser[Number(prescriptionModel?.documentTypeId)] ===
        DocumentTypeNameEnum.OTHERS;

    const isExamRequest =
        DocumentNameParser[Number(prescriptionModel?.documentTypeId)] ===
        DocumentTypeNameEnum.EXAM_REQUEST;

    function formReset() {
        setCertificateDate("");
        setCertificateHour("");
        setCertificateOrientation(undefined);
        setContent(undefined);
        setTitle(undefined);
        setIndexOfFreeText([]);

        formik.resetForm();
    }

    function addNewExam() {
        const aux = examList;
        aux.push({
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
            active: true,
            id: 0,
            medicineId: 0,
            prescriptionModelId: 0,
            createDate: "",
            updateDate: "",
            quantity: 0,
        });
        setExamList(aux);
        forceUpdate();
    }

    async function getDoctorName() {
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        setDoctorId(Number(docId));
    }

    function redirectToMainPage() {
        const shouldGoToEditPage =
            searchParams.get("edit") === "true" &&
            searchParams.get("isFromMainPage") === "false";
        const shouldGoToMainPage =
            searchParams.get("isFromMainPage") === "true" &&
            searchParams.get("edit") === "false";
        const shouldGoToPrescriptionPage =
            searchParams.get("edit") === "false" &&
            searchParams.get("isFromMainPage") === "false";

        if (shouldGoToEditPage) {
            navigate(`/editPrescription/${searchParams.get("docId")}`);
        } else if (shouldGoToMainPage) {
            navigate(`/showPrescriptions/${doctorId}`);
        } else if (shouldGoToPrescriptionPage) {
            navigate(`/prescription`);
        }
    }

    async function getInfo() {
        const prescriptionResult = await getPrescriptionModelById(
            Number(prescriptionModelId),
        );

        if (
            DocumentNameParser[Number(prescriptionResult?.documentTypeId)] ===
            DocumentTypeNameEnum.CERTIFICATE
        ) {
            setCertificateDate(String(prescriptionResult.date) as any);
            setCertificateHour(String(prescriptionResult.hour));
        }

        prescriptionResult.prescriptionCompositonsModels.forEach(
            (pc: IPrescriptionCompositionModel) => {
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
        const normalCompositions =
            prescriptionResult.prescriptionCompositonsModels.filter(
                (pc) =>
                    !pc.isOrientation &&
                    !pc.isContent &&
                    !pc.isTitle &&
                    !pc.isJustification &&
                    !pc.examId,
            );
        await formik.setValues(normalCompositions);
        formik.values = normalCompositions;
        setPrescriptionModel(prescriptionResult);
        forceUpdate();
    }

    function addNewPrescriptionComposition() {
        formik.values.push(emptyPC as any);
        forceUpdate();
    }

    function addNewFreeText() {
        formik.values.push(emptyFreeText as any);
        const index = formik.initialValues.length - 1;
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
            if (indexOfFreeText[index] && component.dosage === null) {
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

    const validationSchema = Yup.object().shape({
        activePrinciple: Yup.string().required("O campo é obrigatório."),
        description: Yup.string().required("O campo é obrigatório."),
        dosage: Yup.string().required("O campo é obrigatório."),
        medicine: Yup.string().required("O campo é obrigatório."),
        packing: Yup.string().required("O campo é obrigatório."),
    });

    const formik = useFormik({
        initialValues: [] as any[],
        validationSchema,
        onSubmit: async (values: IPrescriptionCompositionModel[]) => {
            try {
                const isCertificate =
                    DocumentNameParser[
                        Number(prescriptionModel?.documentTypeId)
                    ] === DocumentTypeNameEnum.CERTIFICATE;

                const isOthers =
                    DocumentNameParser[
                        Number(prescriptionModel?.documentTypeId)
                    ] === DocumentTypeNameEnum.OTHERS;

                const isPrescription =
                    DocumentNameParser[
                        Number(prescriptionModel?.documentTypeId)
                    ] === DocumentTypeNameEnum.PRESCRIPTION;

                const compositions = values?.filter(
                    (composition) => composition !== undefined,
                );

                if (isPrescription) {
                    const invalidCompositions = compositions.filter(
                        (composition) =>
                            (!composition.medicineId && composition.dosage) ||
                            (composition.medicineId && !composition.dosage),
                    );

                    if (invalidCompositions.length) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="Todos os industrializados devem estar preenchidos"
                            />,
                        );
                        return;
                    }
                }

                if (isCertificate) {
                    compositions.push(
                        certificateOrientation as IPrescriptionCompositionModel,
                    );
                }

                if (isOthers) {
                    if (
                        !title?.description.length ||
                        !content?.description.length
                    ) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="O campos titulo e conteúdo devem ser preenchidos!"
                            />,
                        );
                        return;
                    } else {
                        compositions.push(title);
                        compositions.push(content);
                    }
                }

                if (isExamRequest) {
                    if (examList.length > 0) {
                        const emptyExams = [];
                        examList.forEach((exam: any) => {
                            if (exam.examId === 0) emptyExams.push(exam);
                        });

                        if (emptyExams.length) {
                            toast.error(
                                <ToastMessage
                                    title="Erro"
                                    description="Todos os exames devem ser preenchidos"
                                />,
                            );
                            return;
                        }
                    }
                    compositions.push(
                        justification as IPrescriptionCompositionModel,
                    );
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

                if (compositions.length === 0) {
                    toast.error(
                        <ToastMessage
                            title="Erro!"
                            description="Documento inválido. Preencha todos os campos e tente novamente!"
                        />,
                    );
                    return;
                }

                const unregularIndustrializedComposotion = compositions.filter(
                    (pc: ICreatePrescriptionCompositionDto) =>
                        pc?.medicineId && !pc.dosage,
                );

                if (unregularIndustrializedComposotion.length > 0) {
                    toast.error(
                        <ToastMessage
                            title="Erro"
                            description="Todos os industrializados devem conter um texto de posologia!"
                        />,
                    );
                    return;
                }

                await updatePrescriptionModel({
                    prescriptionCompositonsModels: compositions,
                    date: String(certificateDate),
                    hour: String(certificateHour),
                    active: !!prescriptionModel?.active,
                    createDate: String(prescriptionModel?.createDate),
                    doctorId: Number(prescriptionModel?.doctorId),
                    documentTypeId: Number(prescriptionModel?.documentTypeId),
                    id: Number(prescriptionModel?.id),
                    idPrescriptionType: Number(
                        prescriptionModel?.idPrescriptionType,
                    ),
                    title: String(prescriptionModel?.title),
                    updateDate: String(prescriptionModel?.updateDate),
                });
                setPrescriptionModel(prescriptionModel);
                toast.success(
                    <ToastMessage
                        title="Atualizado!"
                        description="Modelo atualizado"
                    />,
                );
                formReset();
                redirectToMainPage();
            } catch (error) {
                console.log(error);

                toast.error(
                    <ToastMessage
                        title="Erro"
                        description="Erro ao atualizar modelo"
                    />,
                );
            }
        },
    });

    useEffect(() => {
        void getDoctorName();
    }, []);

    useEffect(() => {
        if (doctorId) {
            void getInfo();
        }
    }, [doctorId]);

    function removeExam(index: number) {
        const examIdList = examList;
        examIdList.splice(index, 1);
        setExamList(examIdList);
        forceUpdate();
    }

    return (
        <>
            <Header id={Number(doctorId)} />
            <form onSubmit={formik.handleSubmit}>
                <Flex
                    backgroundColor="#3E4C62"
                    width="100%"
                    height="58px"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="20px"
                >
                    <Text fontWeight={800} color="#F7F8FA" textAlign="center">
                        Edição de modelo
                    </Text>
                </Flex>
                <Box
                    className="pageBody"
                    width={{ base: "100%", md: "1000px" }}
                    margin="auto"
                    paddingBottom="150px"
                >
                    <Box my={6}>
                        <BackButton />
                    </Box>
                    <Box
                        backgroundColor={"#F7F8FA"}
                        padding="15px"
                        width={{ base: "100%", md: "100%" }}
                        marginBottom="20px"
                        borderRadius="4px"
                        boxShadow="md"
                    >
                        <BoxTitle text="Nome" />
                        <Input
                            required
                            onChange={(e: any) =>
                                setPrescriptionModel({
                                    ...prescriptionModel,
                                    title: e.target.value,
                                } as IPrescriptionModel)
                            }
                            value={String(prescriptionModel?.title)}
                            id={`title`}
                            placeholder="Nome do modelo"
                        />
                        {prescriptionModel?.title ? null : (
                            <FormError message="A Nome do modelo é obrigatório" />
                        )}
                    </Box>
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
                                        const value: IPrescriptionCompositionModel =
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
                                                createDate: String(
                                                    title?.createDate,
                                                ),

                                                active: !!title?.active,
                                                id: Number(title?.id),

                                                updateDate: String(
                                                    title?.updateDate,
                                                ),
                                                isContent: !!title?.isContent,
                                                isTitle: !!title?.isTitle,
                                                prescriptionModelId: Number(
                                                    title?.prescriptionModelId,
                                                ),
                                                isJustification:
                                                    !!title?.isJustification,
                                                examId: Number(title?.examId),
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
                                />
                                <Input
                                    onChange={(e: any) => {
                                        const value: IPrescriptionCompositionModel =
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
                                                createDate: String(
                                                    content?.createDate,
                                                ),

                                                active: !!content?.active,
                                                id: Number(content?.id),
                                                prescriptionModelId: Number(
                                                    content?.prescriptionModelId,
                                                ),
                                                updateDate: String(
                                                    content?.updateDate,
                                                ),
                                                isContent: !!content?.isContent,
                                                isTitle: !!content?.isTitle,
                                                isJustification:
                                                    !!content?.isJustification,
                                                examId: Number(content?.examId),
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
                                    textArea
                                    paddingTopTextArea="15px"
                                />
                            </Box>
                        </>
                    ) : null}

                    {isExamRequest
                        ? examList.map(
                              (
                                  exam:
                                      | ICreatePrescriptionCompositionDto
                                      | IPrescriptionCompositionModel,
                                  index: number,
                              ) => (
                                  <ExamSearchModel
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

                    {isExamRequest ? (
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
                                        const value: IPrescriptionCompositionModel =
                                            {
                                                activePrinciple:
                                                    justification?.activePrinciple
                                                        ? justification?.activePrinciple
                                                        : "",
                                                dosage: justification?.dosage
                                                    ? justification?.dosage
                                                    : "",
                                                prescriptionModelId: Number(
                                                    justification?.prescriptionModelId,
                                                ),
                                                isOrientation:
                                                    !!justification?.isOrientation,
                                                medicine:
                                                    justification?.medicine
                                                        ? justification?.medicine
                                                        : "",

                                                packing: justification?.packing
                                                    ? justification?.packing
                                                    : "",

                                                description: e.target.value,
                                                createDate: String(
                                                    justification?.createDate,
                                                ),

                                                active: !!justification?.active,
                                                id: Number(justification?.id),

                                                updateDate: String(
                                                    justification?.updateDate,
                                                ),
                                                isContent:
                                                    !!justification?.isContent,
                                                isTitle:
                                                    !!justification?.isTitle,
                                                isJustification:
                                                    !!justification?.isJustification,
                                                examId: Number(
                                                    justification?.examId,
                                                ),
                                                medicineId: Number(
                                                    justification?.examId,
                                                ),
                                                quantity: Number(
                                                    justification?.quantity,
                                                ),
                                            };
                                        setJustification(value);
                                    }}
                                />
                            </Box>
                        </>
                    ) : null}

                    {isCertificate ? (
                        <FreeTextPrescription
                            key={0}
                            index={0}
                            handleChange={(e: any) => {
                                const value: IPrescriptionCompositionModel = {
                                    activePrinciple:
                                        certificateOrientation?.activePrinciple
                                            ? certificateOrientation?.activePrinciple
                                            : "",
                                    dosage: certificateOrientation?.dosage
                                        ? certificateOrientation?.dosage
                                        : "",

                                    isOrientation:
                                        !!certificateOrientation?.isOrientation,
                                    medicine: certificateOrientation?.medicine
                                        ? certificateOrientation?.medicine
                                        : "",

                                    packing: certificateOrientation?.packing
                                        ? certificateOrientation?.packing
                                        : "",

                                    description: e.target.value,
                                    createDate: String(
                                        certificateOrientation?.createDate,
                                    ),

                                    active: !!certificateOrientation?.active,
                                    id: Number(certificateOrientation?.id),
                                    prescriptionModelId: Number(
                                        certificateOrientation?.prescriptionModelId,
                                    ),
                                    updateDate: String(
                                        certificateOrientation?.updateDate,
                                    ),
                                    isContent:
                                        !!certificateOrientation?.isContent,
                                    isTitle: !!certificateOrientation?.isTitle,
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

                    {formik.values?.map((component, index) => {
                        return returnDocumentComponent(component, index);
                    })}

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
                            <Flex
                                flexDirection="row"
                                flexWrap="nowrap"
                                justifyContent="center"
                            >
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
                            </Flex>
                        </Box>
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
                    <Flex
                        zIndex={5}
                        width={{ base: "100%", md: "50%" }}
                        flexDirection={{ md: "row", base: "column-reverse" }}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Button
                            text={"Cancelar edição"}
                            bgColor={"#FFFFFF"}
                            textColor={"#D72A34"}
                            fontSize={"15px"}
                            onClick={redirectToMainPage}
                            type="button"
                            hasIcon={false}
                            border="1px solid rgba(215, 42, 52, 0.2);"
                            height="47px"
                            width="95%"
                            marginTop="10px"
                        />
                        <Button
                            fontSize={14}
                            text="Salvar alterações do modelo"
                            bgColor="#D72A34"
                            onClick={() => {}}
                            height="47px"
                            textColor="#FFFFFF"
                            hasIcon={false}
                            type="submit"
                            width="95%"
                            marginTop="10px"
                        />
                    </Flex>
                </Flex>
            </form>
        </>
    );
}
