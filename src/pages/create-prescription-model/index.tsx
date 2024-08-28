/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Box, Flex, Text } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useReducer, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
    IPrescriptionCompositionModel,
    IPrescriptionCompositionModelDto,
} from "../../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { ExamSearchModel } from "../../components/examSearchModel";
import { savePrescriptionModel } from "../../services/savePrescriptionModel";
import BackButton from "../../components/BackButton";

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

export function CreatePrescriptionModel() {
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [indexOfFreeText, setIndexOfFreeText] = useState<boolean[]>([]);
    const [certificateOrientation, setCertificateOrientation] =
        useState<string>("");
    const [doctorId, setDoctorId] = useState<number>();
    const [title, setTitle] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [modelTitle, setModelTitle] = useState<string>();
    const [content, setContent] = useState<string>("");
    const [justification, setJustification] = useState<string>("");
    type examType =
        | ICreatePrescriptionCompositionDto
        | IPrescriptionCompositionModel;
    const [examList, setExamList] = useState<examType[]>([
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
            quantity: 0,
        },
    ]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isCertificate =
        DocumentNameParser[Number(searchParams.get("documentTypeId"))] ===
        DocumentTypeNameEnum.CERTIFICATE;

    const isPrescription =
        DocumentNameParser[Number(searchParams.get("documentTypeId"))] ===
        DocumentTypeNameEnum.PRESCRIPTION;

    const isOthers =
        DocumentNameParser[Number(searchParams.get("documentTypeId"))] ===
        DocumentTypeNameEnum.OTHERS;

    const isExamRequest =
        DocumentNameParser[Number(searchParams.get("documentTypeId"))] ===
        DocumentTypeNameEnum.EXAM_REQUEST;

    function formReset() {
        setCertificateOrientation("");
        setContent("");
        setTitle("");
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
        navigate(`/showPrescriptions/${doctorId}`);
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
        ] as any[],
        validationSchema,
        onSubmit: async (values: ICreatePrescriptionCompositionDto[]) => {
            try {
                setLoading(true);
                if (isOthers) {
                    if (!content?.length || !title.length) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="Os titulo e conteúdo devem ser preenchidos!"
                            />,
                        );
                        setLoading(false);
                        return;
                    }
                }
                if (isExamRequest) {
                    const validExams = examList.filter(
                        (exam: examType) => exam.examId !== 0,
                    );

                    if (validExams.length === 0) {
                        toast.error(
                            <ToastMessage
                                title="Atenção"
                                description="Você deve selecionar um exame!"
                            />,
                        );
                        setLoading(false);
                        return;
                    }

                    const emptyExams = examList.filter(
                        (exam: examType) => exam.examId === 0,
                    );

                    if (emptyExams.length > 0) {
                        toast.error(
                            <ToastMessage
                                title="Atenção"
                                description="Todos os exames devem ser preenchidos!"
                            />,
                        );
                        setLoading(false);
                        return;
                    }
                }
                const compositions = values?.filter(
                    (composition) => composition !== undefined,
                );

                if (isCertificate) {
                    compositions.push({
                        activePrinciple: "",
                        description: String(certificateOrientation),
                        dosage: "",
                        medicine: "",
                        packing: "",
                        orientation: "",
                        isOrientation: true,
                        isContent: false,
                        isTitle: false,
                        isJustification: false,
                        examId: 0,
                        medicineId: 0,
                        quantity: 0,
                    });
                }

                if (isOthers) {
                    compositions.push({
                        activePrinciple: "",
                        description: String(title),
                        dosage: "",
                        medicine: "",
                        packing: "",
                        orientation: "",
                        isOrientation: false,
                        isContent: false,
                        isTitle: true,
                        isJustification: false,
                        examId: 0,
                        medicineId: 0,
                        quantity: 0,
                    });
                    compositions.push({
                        activePrinciple: "",
                        description: String(content),
                        dosage: "",
                        medicine: "",
                        packing: "",
                        orientation: "",
                        isOrientation: false,
                        isContent: true,
                        isTitle: false,
                        isJustification: false,
                        examId: 0,
                        medicineId: 0,
                        quantity: 0,
                    });
                }

                if (isExamRequest) {
                    if (String(justification).length > 0) {
                        compositions.push({
                            activePrinciple: "",
                            description: String(justification),
                            dosage: "",
                            medicine: "",
                            packing: "",
                            orientation: "",
                            isOrientation: false,
                            isContent: false,
                            isTitle: false,
                            isJustification: true,
                            examId: 0,
                            medicineId: 0,
                            quantity: 0,
                        });
                    }
                    if (examList.length > 0) {
                        examList.forEach((newPc: any) =>
                            compositions.push(newPc),
                        );
                    }
                }

                if (compositions.length === 0) {
                    toast.error(
                        <ToastMessage
                            title="Erro!"
                            description="Documento inválido. Preencha todos os campos e tente novamente!"
                        />,
                    );
                    setLoading(false);
                    return;
                }
                if (isPrescription) {
                    const unregularIndustrializedComposotion =
                        compositions.filter(
                            (pc: ICreatePrescriptionCompositionDto) =>
                                (pc.medicineId &&
                                    !pc.dosage &&
                                    !pc.description) ||
                                (!pc.medicineId &&
                                    pc.dosage &&
                                    !pc.description) ||
                                (!pc.medicineId &&
                                    !pc.dosage &&
                                    !pc.description),
                        );

                    if (unregularIndustrializedComposotion.length > 0) {
                        toast.error(
                            <ToastMessage
                                title="Erro"
                                description="Todos os industrializados devem conter um texto de posologia e medicamento!"
                            />,
                        );
                        setLoading(false);
                        return;
                    }
                }

                await savePrescriptionModel({
                    doctorId: Number(doctorId),
                    title: String(modelTitle),
                    prescriptionComposition:
                        compositions as IPrescriptionCompositionModelDto[],
                    prescriptionType: 1,
                    documentTypeId: Number(searchParams.get("documentTypeId")),
                    date: "",
                    hour: "",
                });
                toast.success(
                    <ToastMessage
                        title="Sucesso!"
                        description="Modelo criado"
                    />,
                );
                formReset();
                setLoading(false);
                redirectToMainPage();
            } catch (error) {
                console.log(error);

                toast.error(
                    <ToastMessage
                        title="Erro"
                        description="Erro ao atualizar modelo"
                    />,
                );
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        void getDoctorName();
    }, []);

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
                        Criação de modelo -{" "}
                        {
                            DocumentNameParser[
                                Number(searchParams.get("documentTypeId"))
                            ]
                        }
                    </Text>
                </Flex>

                <Box
                    className="pageBody"
                    width={{ base: "100%", md: "1000px" }}
                    margin="auto"
                    paddingBottom="150px"
                >
                    <Box marginTop="15px" marginBottom="15px">
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
                            onChange={(e: any) => setModelTitle(e.target.value)}
                            value={modelTitle}
                            id={`modelTitle`}
                            placeholder="Nome do modelo"
                        />
                        {modelTitle ? null : (
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
                                    onChange={(e: any) =>
                                        setTitle(e.target.value)
                                    }
                                    value={String(title)}
                                    id={`title`}
                                    placeholder="Titulo"
                                />
                                <Input
                                    onChange={(e: any) =>
                                        setContent(e.target.value)
                                    }
                                    value={String(content)}
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
                                    value={justification}
                                    onChange={(e: any) =>
                                        setJustification(e.target.value)
                                    }
                                />
                            </Box>
                        </>
                    ) : null}

                    {isCertificate ? (
                        <FreeTextPrescription
                            key={0}
                            index={0}
                            handleChange={(e: any) =>
                                setCertificateOrientation(e.target.value)
                            }
                            descriptionValue={String(certificateOrientation)}
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
                            text={"Cancelar"}
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
                            text="Salvar novo modelo"
                            bgColor="#D72A34"
                            onClick={() => {}}
                            isLoading={loading}
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
