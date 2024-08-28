import React, { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    Text,
    Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ExitModal } from "../ExitModal";
import { formatToCPF, formatToPhone } from "brazilian-values";
import { IDoctorDto } from "../../interfaces/doctor/doctor.dto";
import { IDoctorSpecialityDto } from "../../interfaces/doctor/doctor.speciality.dto";
import { getDoctorById } from "../../services/getDoctorById";
import { BoxTitle } from "../BoxTitle";
import EditDoctor from "../EditDoctor";
import { FlushedInput } from "../FlushedInput";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { ChangePassword } from "../ChangePassword";
import { RegionalCouncilIdToName } from "../../utils/enum/council.enum";
import { formatDateddMMyyyy } from "../../utils/formatDateddMMyyyy";
import { useAccount } from "../../contexts/accountContext";
import { Button } from "../Button";
interface Props {
    doctorId: number;
    showAvatar: boolean;
}

export function ShowInfoModal({ doctorId, showAvatar = true }: Props) {
    const account = useAccount();

    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<IDoctorDto | null>(null);
    const [disabled, setDisabled] = useState<boolean>(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [logout, setLogout] = useState<boolean>(false);

    async function getInfo() {
        const result = await getDoctorById(doctorId);
        setDoctor(result);
        setDisabled(true);
    }

    useEffect(() => {
        if (logout) {
            void deleteToken();
        }
    }, [logout]);

    useEffect(() => {
        if (doctorId) {
            void getInfo();
        }
    }, [doctorId]);

    async function deleteToken(): Promise<void> {
        await asyncLocalStorage.clearAll();
        navigate("/");
    }
    return (
        <React.Fragment>
            {disabled ? (
                <>
                    {showAvatar ? (
                        <Flex>
                            <Box textAlign="right" marginRight="15px">
                                <Text fontWeight={750} color="#202D46">
                                    {account?.name}
                                </Text>
                                <Text fontWeight={400} color="#3E4C62" width={"100%"}>
                                    {`${account?.crm} ${account?.uf}` }
                                </Text>
                            </Box>
                            <Avatar
                                name={account?.name}
                                bg="#F7F8FA"
                                color="black"
                                border="1px solid #94A0B4"
                                _hover={{
                                    cursor: "pointer",
                                    color: "black",
                                }}
                                onClick={onOpen}
                            />
                        </Flex>
                    ) : (
                        <Button
                            width={"179px"}
                            height={"47px"}
                            variant="outline"
                            text="Visualizar/editar"
                            bgColor={"white"}
                            textColor="#3E4C62"
                            onClick={onOpen}
                            hasIcon
                            borderColor="rgba(215, 42, 52, 0.2)"
                            border="2px"
                            fontSize={14}
                            icon={
                                <i
                                    className="ri-pencil-line"
                                    style={{
                                        color: "#D72A34",
                                        alignSelf: "flex-end",
                                    }}
                                ></i>
                            }
                        />
                    )}
                </>
            ) : null}

            <Modal
                scrollBehavior="inside"
                isOpen={isOpen}
                onClose={onClose}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
            >
                <ModalOverlay />
                <ModalContent backgroundColor="white">
                    <ModalHeader>
                        {showAvatar ? "Minha conta" : "Dados do profissional"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        paddingBottom="60px"
                        paddingLeft={0}
                        paddingRight={0}
                    >
                        <Box
                            backgroundColor="#F7F8FA"
                            paddingRight="15px"
                            paddingLeft="15px"
                        >
                            <Box
                                marginBottom="20px"
                                marginLeft={0}
                                paddingLeft={0}
                                paddingTop="20px"
                            >
                                <BoxTitle text="Informações pessoais" />
                            </Box>
                            <FlushedInput
                                label="CPF"
                                value={formatToCPF(String(doctor?.cpf))}
                            />

                            <FlushedInput
                                label="Conselho"
                                value={String(
                                    RegionalCouncilIdToName[
                                        Number(doctor?.councilType)
                                    ],
                                )}
                            />
                            <FlushedInput
                                label="UF do Conselho"
                                value={String(doctor?.councilUf)}
                            />
                            <FlushedInput
                                label="Número do Conselho"
                                value={String(doctor?.crm)}
                            />
                            <FlushedInput
                                label="Nome Completo"
                                value={String(doctor?.name)}
                            />
                            <FlushedInput
                                label="Nome Social"
                                value={String(doctor?.socialName)}
                            />
                            <FlushedInput
                                label="Data de nascimento"
                                value={formatDateddMMyyyy(
                                    new Date(String(doctor?.birthDate)),
                                )}
                            />
                            <FlushedInput
                                label="Sexo biológico"
                                value={String(doctor?.sex)}
                            />
                        </Box>

                        <Box
                            backgroundColor="#F7F8FA"
                            paddingRight="15px"
                            paddingLeft="15px"
                        >
                            <Box
                                marginBottom="20px"
                                marginLeft={0}
                                paddingLeft={0}
                                paddingTop="20px"
                            >
                                <BoxTitle text="Contato" />
                            </Box>
                            <FlushedInput
                                label="E-mail"
                                value={String(doctor?.email)}
                            />
                            <FlushedInput
                                label="Telefone"
                                value={formatToPhone(
                                    String(doctor?.phoneNumber),
                                )}
                            />
                        </Box>

                        {doctor?.doctorSpecialty.map(
                            (
                                speciality: IDoctorSpecialityDto,
                                index: number,
                            ) => (
                                <Box
                                    backgroundColor="#F7F8FA"
                                    paddingRight="15px"
                                    paddingLeft="15px"
                                    key={speciality.id}
                                >
                                    <Box
                                        marginBottom="20px"
                                        marginLeft={0}
                                        paddingLeft={0}
                                        paddingTop="20px"
                                    >
                                        <BoxTitle text="Especialidade" />
                                    </Box>
                                    <FlushedInput
                                        label="Nome da especiliadade"
                                        value={speciality.specialty}
                                    />
                                    {[1, 2].includes(doctor.councilType) ? (
                                        <>
                                            {speciality.registrationNumber
                                                .length ? (
                                                <FlushedInput
                                                    label={
                                                        doctor.councilType === 2
                                                            ? "MAPA"
                                                            : "RQE"
                                                    }
                                                    value={
                                                        speciality.registrationNumber
                                                    }
                                                />
                                            ) : null}
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </Box>
                            ),
                        )}
                        <Box
                            backgroundColor="#F7F8FA"
                            paddingRight="15px"
                            paddingLeft="15px"
                        >
                            <Box
                                marginBottom="20px"
                                marginLeft={0}
                                paddingLeft={0}
                                paddingTop="20px"
                            >
                                <BoxTitle text="Dados da empresa" />
                            </Box>
                            <FlushedInput
                                label="Nome fantasia"
                                value={String(doctor?.address.ownerName)}
                            />
                            <FlushedInput
                                label="E-mail"
                                value={String(doctor?.address.ownerEmail)}
                            />
                            <FlushedInput
                                label="Telefone"
                                value={formatToPhone(
                                    String(doctor?.address.ownerPhone),
                                )}
                            />
                        </Box>

                        <Box
                            backgroundColor="#F7F8FA"
                            paddingRight="15px"
                            paddingLeft="15px"
                        >
                            <Box
                                marginBottom="20px"
                                marginLeft={0}
                                paddingLeft={0}
                                paddingTop="20px"
                            >
                                <BoxTitle text="Endereço da empresa" />
                            </Box>
                            <FlushedInput
                                label="CEP"
                                value={String(doctor?.address.cep)}
                            />
                            <FlushedInput
                                label="UF"
                                value={String(doctor?.address.state)}
                            />
                            <FlushedInput
                                label="Endereço"
                                value={String(doctor?.address.street)}
                            />
                            <FlushedInput
                                label="Número"
                                value={String(doctor?.address.number)}
                            />
                            <FlushedInput
                                label="Cidade"
                                value={String(doctor?.address.city)}
                            />
                            <FlushedInput
                                label="Bairro"
                                value={String(doctor?.address.district)}
                            />
                            <FlushedInput
                                label="Complemento"
                                value={String(doctor?.address.complement)}
                            />
                        </Box>
                    </ModalBody>
                    <ModalFooter
                        position={{ base: "fixed", md: "absolute" }}
                        bottom={0}
                        width="100%"
                        height="72px"
                        backgroundColor="white.10"
                    >
                        <Flex
                            flexDirection="row"
                            width="100%"
                            justifyContent="space-evenly"
                        >
                            <EditDoctor
                                doctorId={doctorId}
                                setDoctor={setDoctor}
                                isAdminEdit={showAvatar}
                            />
                            {showAvatar ? (
                                <>
                                    <ChangePassword
                                        isAdminList={false}
                                        email={String(doctor?.email)}
                                    />
                                    <ExitModal
                                        onClick={() => setLogout(true)}
                                    />
                                </>
                            ) : null}
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}
