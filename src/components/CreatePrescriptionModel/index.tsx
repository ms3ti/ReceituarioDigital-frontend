import {
    Center,
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
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button, FormError, Input } from "../../components";
import { ICreatePrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";
import { ICreatePrescriptionModelDto } from "../../interfaces/prescriptionModel/create.prescriptionModel.dto";
import { IPrescriptionCompositionModelDto } from "../../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { savePrescriptionModel } from "../../services/savePrescriptionModel";
import { documentTypeNameToId } from "../../utils/documentTypeList";
import { DocumentTypeNameEnum } from "../../utils/enum/Document.type.name.enum";
import { formatCompositions } from "../../utils/formatComposition";
import {
    verifyIsEmpty,
    verifyIsFreeText,
    verifyIsFreeTextForOther,
} from "../../utils/verifyIsText";
import { ToastMessage } from "../ToastMessage";

interface Props {
    doctorId: string;
    prescriptionComposition: ICreatePrescriptionCompositionDto[];
    documentId: string;
    date: string;
    hour: string;
    certificateOrientation: string;
    content: string;
    title: string;
    examList: ICreatePrescriptionCompositionDto[];
    justification: string;
}

export function CreatePrescriptionModel({
    documentId,
    prescriptionComposition,
    doctorId,
    date,
    hour,
    certificateOrientation,
    content,
    title,
    examList,
    justification,
}: Props) {
    prescriptionComposition = prescriptionComposition?.filter(
        (pc: ICreatePrescriptionCompositionDto) => pc,
    );
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);

    const validationSchema = Yup.object({
        title: Yup.string().required("Título deve ser informado"),
        isValid: Yup.string().required(
            "Os dados da prescrição devem ser preenchidos",
        ),
    });

    function onOpenModal() {
        onOpen();
        if (
            prescriptionComposition[0].description === "" ||
            prescriptionComposition[0].orientation === ""
        ) {
            formik.initialValues.isValid = "invalid";
            formik.values.isValid = "invalid";
        } else {
            formik.initialValues.isValid = "valid";
            formik.values.isValid = "valid";
        }
    }

    const formik = useFormik({
        initialValues: {
            title: "",
            isValid: "invalid",
        },
        validationSchema,
        onSubmit: async () => {
            const isEmptyCertificate =
                documentId === DocumentTypeNameEnum.CERTIFICATE &&
                (date.length === 0 || hour.length === 0);
            const isEmptyOthersDoc =
                documentId === DocumentTypeNameEnum.OTHERS &&
                (content.length === 0 || title.length === 0);

            if (isEmptyCertificate) {
                toast.error(
                    <ToastMessage
                        title="Erro!"
                        description="Documento inválido. Preencha todos os campos e tente novamente!"
                    />,
                );
                return;
            }
            if (isEmptyOthersDoc) {
                toast.error(
                    <ToastMessage
                        title="Erro!"
                        description="Documento inválido. Preencha todos os campos e tente novamente!"
                    />,
                );
                return;
            }
            setLoading(true);
            try {
                const formatedCompositions = formatCompositions(
                    prescriptionComposition,
                );
                if (date && hour) {
                    formatedCompositions.push({
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

                if (content && title) {
                    formatedCompositions.push({
                        activePrinciple: null,
                        description: content,
                        dosage: null,
                        medicine: null,
                        packing: null,
                        orientation: null,
                        isOrientation: false,
                        isContent: true,
                        isTitle: false,
                        isJustification: false,
                        examId: 0,
                        medicineId: 0,
                        quantity: 0,
                    });
                    formatedCompositions.push({
                        activePrinciple: null,
                        description: title,
                        dosage: null,
                        medicine: null,
                        packing: null,
                        orientation: null,
                        isOrientation: false,
                        isContent: false,
                        isTitle: true,
                        isJustification: false,
                        examId: 0,
                        medicineId: 0,
                        quantity: 0,
                    });
                }

                const compositions = formatedCompositions.filter(
                    (composition) => {
                        if (
                            composition !== undefined &&
                            (verifyIsFreeTextForOther(composition) ||
                                verifyIsFreeText(composition))
                        ) {
                            return composition;
                        }
                        return null;
                    },
                );

                if (justification.length > 0) {
                    compositions.push({
                        activePrinciple: null,
                        description: justification,
                        dosage: null,
                        isContent: false,
                        isOrientation: false,
                        isTitle: false,
                        medicine: null,
                        packing: null,
                        orientation: null,
                        isJustification: true,
                        examId: 0,
                        medicineId: 0,
                        quantity: 0,
                    });
                }

                if (examList.length > 0) {
                    examList.forEach(
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

                formatedCompositions.forEach((composition) => {
                    const shouldPush =
                        composition.isOrientation || composition.medicineId;

                    if (shouldPush) {
                        compositions.push(composition);
                    }
                });
                const filteredCompostion = compositions.filter(
                    (pc: ICreatePrescriptionCompositionDto) =>
                        !verifyIsEmpty(pc),
                );
                if (filteredCompostion.length === 0) {
                    toast.error(
                        <ToastMessage
                            title="Erro!"
                            description="Documento inválido. Preencha todos os campos e tente novamente!"
                        />,
                    );
                    return;
                }
                const payload: ICreatePrescriptionModelDto = {
                    title: formik.values.title,
                    prescriptionComposition:
                        filteredCompostion as IPrescriptionCompositionModelDto[],
                    prescriptionType: 1,
                    doctorId: Number(doctorId),
                    documentTypeId: documentTypeNameToId[String(documentId)],
                    date,
                    hour,
                };
                await savePrescriptionModel(payload);

                toast.success(
                    <ToastMessage
                        title="Novo modelo salvo!!"
                        description="Agora você pode usar este modelo em futuros documentos."
                    />,
                );
                setLoading(false);
                onClose();
                formik.resetForm();
            } catch (error) {
                console.log(error);
                toast.error(
                    <ToastMessage
                        title="Erro!"
                        description="Tivemos algum problema, por favor tente mais tarde."
                    />,
                );
            }
        },
    });

    return (
        <>
            <Center justifyContent="center" alignItems="center">
                <Text
                    onClick={onOpenModal}
                    as="u"
                    height="42px"
                    width="335px"
                    fontWeight={400}
                    fontSize="14px"
                    mt={4}
                    color="black"
                    _hover={{ cursor: "pointer" }}
                >
                    Salvar documento atual como modelo
                </Text>
            </Center>

            <Modal
                isOpen={isOpen}
                motionPreset="slideInBottom"
                isCentered
                size={{ base: "md", md: "sm" }}
                onClose={() => {
                    formik.resetForm();
                    onClose();
                }}
            >
                <ModalOverlay />
                <ModalContent
                    position={{ base: "fixed", md: "absolute" }}
                    marginBottom="0px"
                    width="100%"
                    bottom={{ base: "0px", md: "35%" }}
                    backgroundColor="white"
                >
                    <form onSubmit={formik.handleSubmit}>
                        <ModalHeader borderBottom="1px solid #EDEDF3">
                            {`Salvar como modelo`}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Input
                                width="97%"
                                placeholder="Nome do modelo"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                id="title"
                                name="title"
                            />
                            {formik.values.title === "" ? (
                                <FormError
                                    message={String(formik.errors?.title)}
                                />
                            ) : null}

                            <Input
                                type="hidden"
                                width="97%"
                                placeholder=""
                                value={formik.values.isValid}
                                onChange={formik.handleChange}
                                id="isValid"
                                name="isValid"
                            />

                            {formik.values.isValid === "invalid" ? (
                                <FormError
                                    message={String(formik.errors?.isValid)}
                                />
                            ) : null}
                        </ModalBody>
                        <ModalFooter
                            marginTop="10px"
                            borderTop="1px solid #EDEDF3"
                        >
                            <Button
                                isLoading={loading}
                                disable={!formik.isValid || loading}
                                type="submit"
                                fontSize={14}
                                text="Salvar"
                                bgColor="#D72A34"
                                width="100%"
                                height="47px"
                                hasIcon
                                textColor="#FFFFFF"
                            />
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
}
