import {
    Box,
    Center,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";
import { formatToCPF } from "brazilian-values";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { IPatientDto } from "../../interfaces/patient/patient.dto";
import { IPrescriptionDto } from "../../interfaces/prescription/prescription.dto";
import { IPrescriptionCompositionDto } from "../../interfaces/prescriptionComposotion/prescriptionComposition.dto";
import { getPrescriptionById } from "../../services/getPrescriptionById";
import { DocumentTypeEnum } from "../../utils/enum/document.type.enum";
import {
    DocumentNameParser,
    DocumentTypeNameEnum,
} from "../../utils/enum/Document.type.name.enum";
import { formatExtendedDate } from "../../utils/formatExtendedDate";
import CertificateItem from "../CertificateItem";
import ExamItem from "../ExamItem";
import Menu from "../Menu";
import PrescriptionItem from "../PrescriptionItem";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    loadingModal: boolean;
    person: IPatientDto;
    precrisptionId: number;
    prescriptionsCompositions: IPrescriptionCompositionDto;
    compositions: IPrescriptionCompositionDto[];
    assigned: boolean;
    resetList: (id?: number) => void;
    setAssigned: Dispatch<SetStateAction<boolean>>;
    patientCPF: string;
    personId: number;
    patientEmail: string;
    patientPhoneNumber: string;
}

export function ShowPrescriptionDetails({
    isOpen,
    onClose,
    loadingModal,
    person,
    precrisptionId,
    prescriptionsCompositions,
    compositions,
    assigned,
    resetList,
    setAssigned,
    patientCPF,
    personId,
    patientEmail,
    patientPhoneNumber,
}: Props) {
    const IconFinger = () => <i className="ri-fingerprint-line"></i>;

    const [prescription, setPrescription] = useState<IPrescriptionDto>();
    const [title, setTitle] = useState<IPrescriptionCompositionDto>();
    const [content, setContent] = useState<IPrescriptionCompositionDto>();
    const PrescriptionType = [
        "Receita simples",
        "Receita Controlada",
        "Receita Antimicrobiana",
    ];

    async function getPrescription() {
        const result = await getPrescriptionById(precrisptionId);
        const titleInfo = result.prescriptionCompositons.find(
            (pc) => pc.isTitle,
        );
        const contentInfo = result.prescriptionCompositons.find(
            (pc) => pc.isContent,
        );

        if (titleInfo) {
            setTitle(titleInfo);
        }
        if (contentInfo) {
            setContent(contentInfo);
        }

        setPrescription(result);
    }

    useEffect(() => {
        if (precrisptionId !== 0 && !isNaN(Number(precrisptionId))) {
            void getPrescription();
        }
    }, [precrisptionId]);

    const showHeader =
        prescription?.documentTypeId === DocumentTypeEnum.Atestado_Médico ||
        prescription?.documentTypeId === DocumentTypeEnum.Outros ||
        prescription?.documentTypeId === DocumentTypeEnum["Pedido de exame"];

    function generateComponent() {
        if (showHeader) {
            return (
                <>
                    <Flex
                        flexDirection="column"
                        flexWrap="wrap"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <Text fontWeight={800} fontSize="12px">
                            {
                                PrescriptionType[
                                    Number(
                                        prescriptionsCompositions?.idPrescriptionType,
                                    ) - 1
                                ]
                            }
                        </Text>
                        <Text color="#7D899D" fontWeight={400} fontSize={12}>
                            {person.hasResponsible
                                ? `Responsável: ${
                                      person?.responsibleName
                                  } | CPF: ${formatToCPF(
                                      String(person?.responsibleCPF),
                                  )}`
                                : null}
                        </Text>
                        <Text fontSize={"lg"} fontWeight={800}>
                            {person?.name}
                        </Text>
                        <Text fontSize={"sm"} fontWeight={900}>
                            {formatExtendedDate(
                                new Date(
                                    String(
                                        prescriptionsCompositions?.createDate,
                                    ),
                                ),
                            )}
                        </Text>
                        <Flex
                            direction="row"
                            width="100%"
                            justifyContent="space-between"
                        >
                            <Text
                                color={"gray.200"}
                                fontSize={"xs"}
                                fontWeight={400}
                            >
                                ID {prescriptionsCompositions?.id}
                            </Text>
                            <Text
                                textAlign="right"
                                color="#7D899D"
                                fontSize={12}
                                fontWeight={400}
                            >
                                {prescription.shouldShowDate
                                    ? "Exibindo data no documento PDF"
                                    : "Não exibindo data no documento PDF"}
                            </Text>
                        </Flex>
                    </Flex>

                    {compositions.map(
                        (
                            prescriptionItem: IPrescriptionCompositionDto,
                            index: number,
                        ) =>
                            prescriptionItem.examId ? (
                                <ExamItem
                                    key={index}
                                    examId={prescriptionItem.examId}
                                />
                            ) : null,
                    )}

                    {prescription?.documentTypeId ===
                    DocumentTypeEnum.Outros ? (
                        <CertificateItem title={title} content={content} />
                    ) : null}

                    {compositions.map(
                        (
                            prescriptionItem: IPrescriptionCompositionDto,
                            index: number,
                        ) =>
                            prescriptionItem.isOrientation ? (
                                <CertificateItem
                                    key={index}
                                    data={prescriptionItem}
                                    hour={String(prescription?.hour)}
                                    date={String(prescription?.date)}
                                />
                            ) : null,
                    )}

                    {compositions.map(
                        (
                            prescriptionItem: IPrescriptionCompositionDto,
                            index: number,
                        ) =>
                            prescriptionItem.isOrientation &&
                            prescriptionItem.isJustification ? (
                                <CertificateItem
                                    key={index}
                                    data={prescriptionItem}
                                    hour={String(prescription?.hour)}
                                    date={String(prescription?.date)}
                                />
                            ) : null,
                    )}

                    {compositions.map(
                        (
                            prescriptionItem: IPrescriptionCompositionDto,
                            index: number,
                        ) =>
                            prescriptionItem.isJustification &&
                            prescriptionItem.description !== "" ? (
                                <CertificateItem
                                    key={index}
                                    data={prescriptionItem}
                                    hour={String(prescription?.hour)}
                                    date={String(prescription?.date)}
                                />
                            ) : null,
                    )}

                    {compositions.map(
                        (
                            prescriptionItem: IPrescriptionCompositionDto,
                            index: number,
                        ) =>
                            !prescriptionItem.isOrientation &&
                            !prescriptionItem.isTitle &&
                            !prescriptionItem.isJustification &&
                            !prescriptionItem.isContent &&
                            !prescriptionItem.examId &&
                            !prescriptionItem.medicineId ? (
                                <CertificateItem
                                    key={index}
                                    data={prescriptionItem}
                                    hour={String(prescription?.hour)}
                                    date={String(prescription?.date)}
                                />
                            ) : null,
                    )}
                    {assigned ? (
                        <Box
                            padding="15px"
                            width="100%"
                            borderRadius={"8px"}
                            border="1px solid #EDEDF3"
                            mt={"8px"}
                        >
                            <Flex
                                flexDirection="row"
                                flexWrap="nowrap"
                                justifyContent="flex-start"
                                alignItems="center"
                            >
                                <Center
                                    width={"40px"}
                                    height={"40px"}
                                    color={"green.100"}
                                    borderRadius={"4px"}
                                    background={"rgba(28, 193, 98, 0.05)"}
                                    aria-label="Icon Fingerprint"
                                >
                                    <IconFinger />
                                </Center>

                                <Flex
                                    flexDirection="column"
                                    flexWrap="nowrap"
                                    ml={"8px"}
                                >
                                    <Text fontSize={"sm"} fontWeight={900}>
                                        Documento assinado
                                    </Text>
                                    <Text
                                        color={"gray.200"}
                                        fontSize={"12px"}
                                        fontWeight={400}
                                    >
                                        Assinado{" "}
                                        {formatExtendedDate(
                                            new Date(
                                                String(prescription.updateDate),
                                            ),
                                        )}
                                    </Text>
                                </Flex>
                            </Flex>
                        </Box>
                    ) : null}
                </>
            );
        }

        if (prescription?.documentTypeId === DocumentTypeEnum.Receita) {
            return (
                <>
                    <Flex
                        flexDirection="column"
                        flexWrap="wrap"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        {person.hasResponsible ? (
                            <Text
                                color="#7D899D"
                                fontWeight={400}
                                fontSize={12}
                            >{`Responsável: ${
                                person?.responsibleName
                            } | CPF Responsável: ${formatToCPF(
                                String(person?.responsibleCPF),
                            )}`}</Text>
                        ) : null}

                        <Text fontSize={"lg"} fontWeight={800}>
                            {person?.name}
                        </Text>
                        <Text fontSize={"sm"} fontWeight={900}>
                            {formatExtendedDate(
                                new Date(
                                    String(
                                        prescriptionsCompositions?.createDate,
                                    ),
                                ),
                            )}
                        </Text>
                        <Flex
                            direction="row"
                            width="100%"
                            justifyContent="space-between"
                        >
                            <Text
                                color={"gray.200"}
                                fontSize={"xs"}
                                fontWeight={400}
                            >
                                ID {prescriptionsCompositions?.id}
                            </Text>
                            <Text
                                textAlign="right"
                                color="#7D899D"
                                fontSize={12}
                                fontWeight={400}
                            >
                                {prescription.shouldShowDate
                                    ? "Exibindo data no documento PDF"
                                    : "Não exibindo data no documento PDF"}
                            </Text>
                        </Flex>
                    </Flex>
                    <Flex flexDirection="column" flexWrap="nowrap">
                        {compositions.map((prescription, index) => (
                            <PrescriptionItem key={index} data={prescription} />
                        ))}

                        {assigned ? (
                            <Box
                                padding="15px"
                                width="100%"
                                borderRadius={"8px"}
                                border="1px solid #EDEDF3"
                                mt={"8px"}
                            >
                                <Flex
                                    flexDirection="row"
                                    flexWrap="nowrap"
                                    justifyContent="flex-start"
                                    alignItems="center"
                                >
                                    <Center
                                        width={"40px"}
                                        height={"40px"}
                                        color={"green.100"}
                                        borderRadius={"4px"}
                                        background={"rgba(28, 193, 98, 0.05)"}
                                        aria-label="Icon Fingerprint"
                                    >
                                        <IconFinger />
                                    </Center>

                                    <Flex
                                        flexDirection="column"
                                        flexWrap="nowrap"
                                        ml={"8px"}
                                    >
                                        <Text fontSize={"sm"} fontWeight={900}>
                                            Documento assinado
                                        </Text>
                                        <Text
                                            color={"gray.200"}
                                            fontSize={"12px"}
                                            fontWeight={400}
                                        >
                                            Assinado{" "}
                                            {formatExtendedDate(
                                                new Date(
                                                    String(
                                                        prescription.updateDate,
                                                    ),
                                                ),
                                            )}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Box>
                        ) : null}
                    </Flex>
                </>
            );
        }
    }

    return (
        <Modal
            motionPreset="slideInBottom"
            size={{ base: "full", md: "2xl" }}
            isOpen={isOpen}
            onClose={() => {
                onClose();
            }}
        >
            <ModalOverlay />
            <ModalContent backgroundColor="white">
                <ModalHeader
                    borderBottom={"1px"}
                    borderBottomColor={"gray.500"}
                >
                    {DocumentNameParser[
                        Number(prescription?.documentTypeId)
                    ] === DocumentTypeNameEnum.PRESCRIPTION
                        ? PrescriptionType[
                              Number(
                                  prescriptionsCompositions?.idPrescriptionType,
                              ) - 1
                          ]
                        : DocumentNameParser[
                              Number(prescription?.documentTypeId)
                          ]}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody paddingBottom={"90px"}>
                    {loadingModal ? (
                        <Center flexDirection="column">
                            <Text
                                color="red.100"
                                fontSize={14}
                                fontWeight="900"
                            ></Text>
                            <ReactLoading
                                type="spin"
                                color="#D72A34"
                                width="35px"
                                height="35px"
                            />
                        </Center>
                    ) : (
                        generateComponent()
                    )}
                </ModalBody>
                <ModalFooter
                    zIndex={1}
                    justifyContent="space-around"
                    position={{ base: "fixed", md: "absolute" }}
                    bottom={0}
                    width={"100%"}
                    height="74px"
                    borderTop={"1px"}
                    borderTopColor={"gray.500"}
                >
                    <Menu
                        assigned={assigned}
                        prescriptionId={Number(precrisptionId)}
                        resetList={resetList}
                        setAssigned={setAssigned}
                        prescription={prescription as IPrescriptionDto}
                        personId={personId}
                        patientCPF={patientCPF}
                        cellphone={patientPhoneNumber}
                        email={patientEmail}
                    />
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
