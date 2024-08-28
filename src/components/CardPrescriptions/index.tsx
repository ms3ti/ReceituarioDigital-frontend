import {
    Box,
    Flex,
    Text,
    useDisclosure,
    useMediaQuery,
} from "@chakra-ui/react";
import { isCPF } from "brazilian-values";
import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IPatientDto } from "../../interfaces/patient/patient.dto";
import { IPrescriptionDto } from "../../interfaces/prescription/prescription.dto";
import { getDocSigned } from "../../services/getDocSigned";
import { getDocStatus } from "../../services/getDocStatus";
import { getPatientById } from "../../services/getPatientById";
import { getPrescriptionById } from "../../services/getPrescriptionById";
import { getPrintInfo } from "../../services/getPrintInfo";
import { patchPatient } from "../../services/patchPatient";
import { receitaCpfApi } from "../../services/receitaCpfApi";
import { signDocument } from "../../services/signDocument";
import { updateSignDocument } from "../../services/updateSignDocument";
import { DocumentTypeEnum } from "../../utils/enum/document.type.enum";
import { DocumentNameParser } from "../../utils/enum/Document.type.name.enum";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { PrescriptionTypeIdToNameEnum } from "../../utils/enum/prescription.type.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { formatToHour } from "../../utils/formatToHour";
import { removeMask } from "../../utils/removeMask";
import { AddCPF } from "../AddCPF";
import { Button } from "../Button";
import { SharedDocument } from "../ShareDocument";
import { ToastMessage } from "../ToastMessage";

interface Props {
    name?: string;
    createDate?: string;
    assignDate?: string;
    isSigned: boolean;
    onClick: any;
    documentTypeId: number;
    idPrescriptionType: number;
    prescriptionId: number;
    resetList: (id?: number) => void;
}

export default function CardPrescriptions({
    name,
    assignDate,
    onClick,
    documentTypeId,
    idPrescriptionType,
    prescriptionId,
    resetList,
}: Props) {
    const navigate = useNavigate();
    const [cpf, setCPF] = useState("");
    const [loading, setLoading] = useState(false);
    const [prescription, setPrescription] = useState<IPrescriptionDto>();
    const [patient, setPatient] = useState<IPatientDto>();
    const [loadingPDF, setLoadingPDF] = useState(false);
    const [showShareDocument, setShowShareDocument] = useState(false);
    const [isLargerThan800] = useMediaQuery("(min-width: 800px)");

    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const {
        isOpen: isOpenAddCPF,
        onOpen: onOpenAddCPF,
        onClose: onCloseAddCPF,
    } = useDisclosure();

    async function repeatPrescription() {
        const result = await getPrescriptionById(prescriptionId);
        await asyncLocalStorage.setItem(
            localStorageKeys.PRESCRIPTION_REPEAT,
            JSON.stringify(result),
        );
        navigate("/prescription?repeat=true");
    }

    async function closeAddCPF() {
        if (patient) {
            const oldPatientCPF = patient.cpf;
            try {
                if (isCPF(cpf)) {
                    const doctorId = await asyncLocalStorage.getItem(
                        localStorageKeys.DOCTOR_ID,
                    );
                    const result = await receitaCpfApi(cpf);
                    setLoading(true);
                    await patchPatient(String(patient?.personId), {
                        cpf: removeMask.cpf(cpf),
                        doctorId: Number(doctorId),
                        name: result.nome ? result.nome : patient.name,
                    });
                    setCPF(cpf);
                    setPatient({
                        ...patient,
                        cpf: String(cpf),
                    } as IPatientDto);

                    await sign();
                    await getInfo();
                    setLoading(false);
                }
                onCloseAddCPF();
            } catch (error: any) {
                setCPF(patient.cpf);
                setPatient({
                    ...patient,
                    cpf: oldPatientCPF,
                } as IPatientDto);
                toast.error(
                    <ToastMessage title="Erro" description={error.title} />,
                );
                setLoading(false);
                onCloseAddCPF();
            }
        }
        onCloseAddCPF();
    }

    async function getInfo() {
        const resultPrescription = await getPrescriptionById(prescriptionId);
        const patientResult = await getPatientById(
            resultPrescription.patientId,
        );
        setPatient(patientResult);
        setPrescription(resultPrescription);
    }

    async function sign() {
        if (patient) {
            if (isCPF(patient.cpf)) {
                const newW = 800;
                const newH = 850;
                const left = (window.screen.width - newW) / 2;
                const top = 100;

                const result = await signDocument(prescriptionId, true);

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
                if (!aba || aba.closed || typeof aba.closed === "undefined") {
                    toast.warning(
                        <ToastMessage
                            title="Popup"
                            description="Habilite o Popup do seu navegador!"
                        />,
                    );
                }

                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const timer = setInterval(async function () {
                    if (aba?.closed) {
                        clearInterval(timer);
                        await updateSignDocument(prescriptionId, false);
                        toast.warning(
                            <ToastMessage
                                title="Atenção!"
                                description="Não foi possível assinar o documento!"
                            />,
                        );
                        return;
                    }

                    try {
                        const data = await getDocStatus(
                            result?.signature?.idDocument,
                        );

                        if (data?.status === "F") {
                            clearInterval(timer);
                            aba?.close();
                            await getInfo();
                            forceUpdate();
                            toast.success(
                                <ToastMessage
                                    title="Documento assiando"
                                    description="Documento assinado com sucesso!"
                                />,
                            );
                        }
                    } catch (error) {
                        toast.error(
                            <ToastMessage
                                title="Error"
                                description="Erro ao assinar documento!"
                            />,
                        );
                    }
                }, 3000);
                resetList(prescriptionId);
            } else {
                onOpenAddCPF();
            }
        }
    }

    async function getPdfWithoutSigned() {
        let pdf = "";
        const result = await getPrintInfo(prescriptionId);

        setLoadingPDF(true);
        if (prescription?.assigned) {
            const prescription = await getPrescriptionById(prescriptionId);
            const data = await getDocSigned(prescription?.idDocument);
            pdf = data?.docBase64;
            const linkSource = `data:application/pdf;base64,${String(pdf)}`;
            const downloadLink = document.createElement("a");
            const fileName = `${String(result?.fileName)}.pdf`;
            downloadLink.target = "__blank";
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
        } else {
            pdf = String(result?.buffer);
            const linkSource = `data:application/pdf;base64,${String(pdf)}`;
            const downloadLink = document.createElement("a");
            const fileName = `${String(result?.fileName)}.pdf`;
            downloadLink.target = "__blank";
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
        }
        setLoadingPDF(false);
    }

    function openShareDocument() {
        setShowShareDocument(true);
    }

    useEffect(() => {
        void getInfo();
    }, []);
    return (
        <Box
            padding="15px"
            width={{ base: "95%", md: "100%" }}
            height="auto"
            minH="79px"
            borderRadius={4}
            border="1px solid #EDEDF3"
            onClick={onClick}
            my={2}
            _hover={{
                cursor: "pointer",
                backgroundColor: "white.200",
            }}
        >
            <Flex
                direction={{ base: "column", md: "row" }}
                minHeight="30px"
                justifyContent={{ base: "flex-evenly", md: "space-evenly" }}
                alignItems={{ base: "flex-evenly", md: "space-evenly" }}
            >
                <Text width={{ base: "100%", md: "100%" }} fontWeight={900}>
                    <Text
                        width={"100%"}
                        display="flex"
                        justifyContent="space-between"
                    >
                        {name}
                        {isLargerThan800 ? null : (
                            <i
                                color={"gray.100"}
                                className="ri-arrow-drop-right-line"
                            ></i>
                        )}
                    </Text>

                    <Text fontWeight={500} color="#3E4C62" fontSize="14px">
                        {documentTypeId === DocumentTypeEnum.Receita
                            ? PrescriptionTypeIdToNameEnum[idPrescriptionType]
                            : DocumentNameParser[documentTypeId]}
                    </Text>
                </Text>

                <Flex
                    flexDirection="row"
                    maxWidth="100vw"
                    marginTop={{ base: "15px" }}
                    flexWrap={isLargerThan800 ? undefined : "wrap"}
                >
                    {prescription?.assigned && isLargerThan800 ? (
                        <Flex
                            flexDirection="row"
                            flexWrap="wrap"
                            width="100%"
                            placeContent={
                                isLargerThan800 ? undefined : "center"
                            }
                        >
                            <Flex>
                                <i
                                    color={"gray.100"}
                                    className="ri-fingerprint-line"
                                ></i>
                                <Text
                                    px={"4px"}
                                    py={"4px"}
                                    style={{
                                        width: "120px",
                                    }}
                                    fontSize={12}
                                    fontWeight={"400"}
                                >
                                    Assinado ás{" "}
                                    {formatToHour(String(assignDate))}
                                </Text>
                            </Flex>
                        </Flex>
                    ) : null}

                    <Button
                        text={"Baixar"}
                        hasIcon
                        icon={
                            <i
                                className="ri-download-line"
                                style={{
                                    fontSize: "20px",
                                    color: "#D72A34",
                                    marginRight: -7,
                                }}
                            ></i>
                        }
                        bgColor="#FFFFFF"
                        width={isLargerThan800 ? "100px" : "150px"}
                        height="52px"
                        textColor="#202D46"
                        fontSize={11}
                        onClick={(e: any) => {
                            e.stopPropagation();
                            void getPdfWithoutSigned();
                        }}
                        border="1px solid #EDEDF3"
                        borderRadius="8px"
                        isLoading={loadingPDF}
                    />
                    {prescription?.assigned ? (
                        <Button
                            text={"Repetir"}
                            hasIcon
                            icon={
                                <i
                                    className="ri-file-copy-line"
                                    style={{
                                        fontSize: "20px",
                                        color: "#D72A34",
                                        marginRight: -7,
                                    }}
                                ></i>
                            }
                            bgColor="#FFFFFF"
                            width={isLargerThan800 ? "100px" : "150px"}
                            height="52px"
                            textColor="#202D46"
                            fontSize={11}
                            onClick={(e: any) => {
                                e.stopPropagation();
                                void repeatPrescription();
                            }}
                            border="1px solid #EDEDF3"
                            borderRadius="8px"
                        />
                    ) : null}
                    {prescription?.assigned ? (
                        <Button
                            hasIcon
                            text={"Enviar"}
                            icon={
                                <i
                                    className="ri-share-forward-line"
                                    style={{
                                        fontSize: "20px",
                                        color: "#D72A34",
                                        marginRight: -7,
                                    }}
                                ></i>
                            }
                            bgColor="#FFFFFF"
                            width={isLargerThan800 ? "100px" : "95%"}
                            height="52px"
                            marginTop={isLargerThan800 ? undefined : "15px"}
                            textColor="#202D46"
                            fontSize={11}
                            onClick={(e: any) => {
                                e.stopPropagation();
                                openShareDocument();
                            }}
                            border="1px solid #EDEDF3"
                            borderRadius="8px"
                        />
                    ) : null}
                    {!prescription?.assigned ? (
                        <Button
                            text={"Assinar"}
                            icon={
                                <i
                                    className="ri-pen-nib-line"
                                    style={{
                                        fontSize: "20px",
                                        marginRight: -7,
                                    }}
                                ></i>
                            }
                            hasIcon
                            bgColor="#D72A34"
                            width={isLargerThan800 ? "100px" : "150px"}
                            height="52px"
                            textColor="#FFFFFF"
                            fontSize={11}
                            onClick={(e: any) => {
                                e.stopPropagation();
                                void sign();
                            }}
                        />
                    ) : null}
                    {prescription?.assigned && !isLargerThan800 ? (
                        <Flex
                            flexDirection="row"
                            flexWrap="wrap"
                            width="100%"
                            placeContent={
                                isLargerThan800 ? undefined : "center"
                            }
                            marginTop={isLargerThan800 ? undefined : "10px"}
                            paddingLeft="7px"
                            justifyContent="left"
                        >
                            <i
                                color={"gray.100"}
                                className="ri-fingerprint-line"
                            ></i>
                            <Text
                                px={"4px"}
                                py={"4px"}
                                style={{
                                    width: "120px",
                                }}
                                textAlign="left"
                                fontSize={12}
                                fontWeight={"400"}
                            >
                                Assinado ás {formatToHour(String(assignDate))}
                            </Text>
                        </Flex>
                    ) : null}
                </Flex>
            </Flex>
            <AddCPF
                isOpen={isOpenAddCPF}
                onOpen={onOpenAddCPF}
                // eslint-disable-next-line no-void
                onClose={() => void closeAddCPF()}
                cpf={cpf}
                text=""
                setCPF={setCPF}
                loading={loading}
            />
            {showShareDocument ? (
                <SharedDocument
                    isOpen={showShareDocument}
                    callGetPdf={getPdfWithoutSigned as any}
                    loading={false}
                    setShowShareDocument={setShowShareDocument}
                    link={String(prescription?.link)}
                    prescriptionId={prescriptionId}
                    cellphone={String(patient?.phoneNumber)}
                    email={String(patient?.email)}
                />
            ) : null}
        </Box>
    );
}
