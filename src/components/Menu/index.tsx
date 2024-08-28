/* eslint-disable @typescript-eslint/no-misused-promises */
import { Box, Container, Flex, Text, useDisclosure } from "@chakra-ui/react";
import { isCPF } from "brazilian-values";
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useReducer,
    useState,
} from "react";
import ReactLoading from "react-loading";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IPrescriptionPDFBufferDto } from "../../interfaces/prescription/IPrescriptionPDFBuffer.dto";
import { IPrescriptionDto } from "../../interfaces/prescription/prescription.dto";
import { getDocSigned } from "../../services/getDocSigned";
import { getDocStatus } from "../../services/getDocStatus";
import { getPrescriptionById } from "../../services/getPrescriptionById";
import { getPrintInfo } from "../../services/getPrintInfo";
import { patchPatient } from "../../services/patchPatient";
import { receitaCpfApi } from "../../services/receitaCpfApi";
import { signDocument } from "../../services/signDocument";
import { updateSignDocument } from "../../services/updateSignDocument";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { removeMask } from "../../utils/removeMask";
import { AddCPF } from "../AddCPF";
import { DeleteDocument } from "../DeleteDocument";
import { SharedDocument } from "../ShareDocument";
import { ToastMessage } from "../ToastMessage";

interface Props {
    prescriptionId: number;
    resetList: (id?: number) => void;
    assigned: boolean;
    prescription: IPrescriptionDto;
    setAssigned: Dispatch<SetStateAction<boolean>>;
    personId: number;
    patientCPF: string;
    cellphone: string;
    email: string;
}

export default function Menu({
    prescriptionId,
    resetList,
    assigned,
    prescription,
    setAssigned,
    patientCPF,
    personId,
    cellphone,
    email,
}: Props) {
    const [pdfBase64, setPdfBase64] = useState<IPrescriptionPDFBufferDto>();
    const [enable, setEnable] = useState(false);
    const [enableSign, setEnableSign] = useState(true);
    const navigate = useNavigate();
    const [showShareDocument, setShowShareDocument] = useState(false);
    const [link, setLink] = useState("");
    const [cpf, setCPF] = useState("");
    const [loading, setLoading] = useState(false);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);

    const {
        isOpen: isOpenAddCPF,
        onOpen: onOpenAddCPF,
        onClose: onCloseAddCPF,
    } = useDisclosure();

    async function getInfo() {
        const result = await getPrintInfo(prescriptionId);
        setPdfBase64(result);
        setEnable(true);
    }

    async function getPdfWithoutSigned() {
        let pdf = "";
        if (enable) {
            if (assigned) {
                const prescription = await getPrescriptionById(prescriptionId);
                const data = await getDocSigned(prescription?.idDocument);
                pdf = data?.docBase64;
            } else {
                pdf = String(pdfBase64?.buffer);
            }
            const linkSource = `data:application/pdf;base64,${String(pdf)}`;
            const downloadLink = document.createElement("a");
            const fileName = `${String(pdfBase64?.fileName)}.pdf`;
            downloadLink.target = "__blank";
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
        }
    }

    function redirectToEdit() {
        navigate(`/editPrescription/${prescriptionId}`);
    }

    function openShareDocument() {
        setShowShareDocument(true);
    }

    async function sign() {
        setEnableSign(false);
        if (isCPF(patientCPF)) {
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

            setLink(result.link);
            prescription.link = result.link;

            const timer = setInterval(async function () {
                if (aba?.closed) {
                    clearInterval(timer);
                    await updateSignDocument(prescription?.id, false);
                    setEnableSign(true);
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
                        resetList();
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
            setEnableSign(true);
        } else {
            onOpenAddCPF();
        }
    }

    async function closeAddCPF() {
        const oldPatientCPF = patientCPF;
        try {
            if (isCPF(cpf)) {
                const doctorId = await asyncLocalStorage.getItem(
                    localStorageKeys.DOCTOR_ID,
                );
                const result = await receitaCpfApi(cpf);
                setLoading(true);
                await patchPatient(String(personId), {
                    cpf: removeMask.cpf(cpf),
                    doctorId: Number(doctorId),
                    name: result.nome,
                });
                setCPF(cpf);
                patientCPF = cpf;

                await sign();
                await getInfo();
                setLoading(false);
            }
            onCloseAddCPF();
        } catch (error: any) {
            setCPF(patientCPF);
            patientCPF = oldPatientCPF;
            toast.error(
                <ToastMessage title="Erro" description={error.title} />,
            );
            setLoading(false);
            onCloseAddCPF();
        }
        setEnableSign(true);
        setLoading(false);
        onCloseAddCPF();
    }

    useEffect(() => {
        forceUpdate();
        void getInfo();
    }, []);

    return (
        <Container>
            <Flex
                flexDirection="row"
                width="100%"
                justifyContent="space-evenly"
                alignItems="center"
                position={{ base: "absolute", md: "relative" }}
                left="-5px"
                top={{ base: "5px", md: "-2px" }}
            >
                {assigned ? (
                    <>
                        <Box
                            textAlign="center"
                            cursor="pointer"
                            minW="95px"
                            onClick={openShareDocument}
                        >
                            <i
                                className="ri-share-forward-line"
                                style={{
                                    color: "#94A0B4",
                                    fontSize: "25px",
                                    alignSelf: "flex-end",
                                }}
                            ></i>
                            <Text
                                fontSize="16px"
                                color="gray.200"
                                fontWeight={500}
                            >
                                Compartilhar
                            </Text>
                        </Box>
                        {showShareDocument ? (
                            <SharedDocument
                                isOpen={showShareDocument}
                                callGetPdf={getPdfWithoutSigned as any}
                                loading={false}
                                setShowShareDocument={setShowShareDocument}
                                link={prescription?.link}
                                prescriptionId={prescriptionId}
                                cellphone={cellphone}
                                email={email}
                            />
                        ) : null}
                    </>
                ) : null}

                {!assigned ? (
                    <Box
                        textAlign="center"
                        onClick={redirectToEdit}
                        cursor="pointer"
                        minW="95px"
                    >
                        <i
                            className="ri-pencil-line"
                            style={{
                                color: "#94A0B4",
                                fontSize: "25px",
                                alignSelf: "flex-end",
                            }}
                        ></i>
                        <Text fontSize="16px" color="gray.200" fontWeight={500}>
                            Editar
                        </Text>
                    </Box>
                ) : null}

                {!assigned ? (
                    <Box
                        textAlign="center"
                        _hover={{
                            cursor: "pointer",
                        }}
                        onClick={getPdfWithoutSigned}
                        minW="95px"
                    >
                        <i
                            className="ri-download-line"
                            style={{
                                color: "#94A0B4",
                                fontSize: "25px",
                                alignSelf: "flex-end",
                            }}
                        ></i>
                        <Text fontSize="16px" color="gray.200" fontWeight={500}>
                            Baixar PDF
                        </Text>
                    </Box>
                ) : null}

                <DeleteDocument
                    prescriptionId={prescriptionId}
                    resetList={resetList}
                />

                {!assigned ? (
                    <>
                        <Box
                            textAlign="center"
                            minW="95px"
                            onClick={sign}
                            _hover={{
                                cursor: "pointer",
                            }}
                        >
                            {enableSign ? (
                                <>
                                    <i
                                        className="ri-pen-nib-line"
                                        style={{
                                            color: "#D72A34",
                                            fontSize: "25px",
                                            alignSelf: "flex-end",
                                        }}
                                    ></i>
                                    <Text
                                        fontSize="16px"
                                        color="red.100"
                                        fontWeight={500}
                                    >
                                        Assinar
                                    </Text>
                                </>
                            ) : (
                                <Flex
                                    justifyContent="center"
                                    alignItems="center"
                                    alignSelf="baseline"
                                    position="relative"
                                    top={5}
                                >
                                    <ReactLoading
                                        type="spin"
                                        color="#D72A34"
                                        width={25}
                                    />
                                </Flex>
                            )}
                        </Box>
                        {showShareDocument ? (
                            <SharedDocument
                                isOpen={showShareDocument}
                                callGetPdf={getPdfWithoutSigned as any}
                                loading={false}
                                setShowShareDocument={setShowShareDocument}
                                link={link}
                                prescriptionId={prescriptionId}
                                cellphone={cellphone}
                                email={email}
                            />
                        ) : null}
                    </>
                ) : null}
            </Flex>
            <AddCPF
                isOpen={isOpenAddCPF}
                onOpen={onOpenAddCPF}
                onClose={closeAddCPF}
                cpf={cpf}
                text=""
                setCPF={setCPF}
                loading={loading}
            />
        </Container>
    );
}
