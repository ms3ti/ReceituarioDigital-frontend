import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IPrescriptionPDFBufferDto } from "../../interfaces/prescription/IPrescriptionPDFBuffer.dto";
import { getDocSigned } from "../../services/getDocSigned";
import { getPrescriptionById } from "../../services/getPrescriptionById";
import { getPrintInfo } from "../../services/getPrintInfo";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { SharedDocument } from "../ShareDocument";
import { ShowSuccessCreatedPrescription } from "../ShowSuccessCreatedPrescription";
import { ToastMessage } from "../ToastMessage";

interface Props {
    onOpen: () => void;
    onClose: () => void;
    isOpen: boolean;
    buttonText: string;
    prescriptionId: number;
    signed: boolean;
    link: string;
    cellphone: string;
    email: string;
}

export function PrescriptionCreatedModal({
    isOpen,
    onOpen,
    onClose,
    buttonText,
    prescriptionId,
    signed,
    link,
    cellphone,
    email,
}: Props) {
    const [pdfBase64, setPdfBase64] = useState<IPrescriptionPDFBufferDto>();
    const [id, setId] = useState<number>();
    const [enable, setEnable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showShareDocument, setShowShareDocument] = useState(signed);

    async function getInfo() {
        try {
            setEnable(true);
            setLoading(true);
            const result = await getPrintInfo(prescriptionId);
            setPdfBase64(result);
            setEnable(false);
            setLoading(false);
        } catch (error) {
            setEnable(false);
            setLoading(false);
            onClose();
            toast.error(
                <ToastMessage
                    title="Erro"
                    description="Erro ao gerar o PDF, por favor tente novamente"
                />,
            );
        }
    }

    async function callGetPdf() {
        await getPdfWithoutSigned();
    }

    async function getPdfWithoutSigned() {
        let pdf = "";
        if (!enable) {
            if (signed) {
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

    async function getDoctorId() {
        const docId = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_ID,
        );
        setId(Number(docId));
    }

    useEffect(() => {
        void getDoctorId();
        void getInfo();
    }, []);

    return (
        <React.Fragment>
            {signed && showShareDocument ? (
                <SharedDocument
                    isOpen={isOpen}
                    callGetPdf={callGetPdf}
                    loading={loading}
                    setShowShareDocument={setShowShareDocument}
                    link={link}
                    prescriptionId={prescriptionId}
                    cellphone={cellphone}
                    email={email}
                />
            ) : (
                <ShowSuccessCreatedPrescription
                    onOpen={onOpen}
                    onClose={onClose}
                    isOpen={isOpen}
                    buttonText={buttonText}
                    id={String(id)}
                    prescriptionId={prescriptionId}
                />
            )}
        </React.Fragment>
    );
}
