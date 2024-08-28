import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { memo, useEffect, useState } from "react";
import { getPersonById } from "../services/getPersonById";
import { requestApproval } from "../services/requestApproval";

interface Props {
    request: string | undefined;
    id: string | undefined;
}

const requests = {
    approved: {
        title: "Conta foi aprovada com sucesso!",
        subtitle:
            "O profissional irá receber um e-mail informativo sobre a aprovação da conta e já pode acessar e utilizar dos benefícios da plataforma.",
    },
    reject: {
        title: "Conta foi rejeitada com sucesso!",
        subtitle:
            "O profissional irá receber um e-mail informativo sobre a rejeição da conta, caso ainda exista interesse pelo profissional, peça para que solicite um novo cadastro.",
    },
    alreadyApproved: {
        title: "Essa conta já foi aprovada!",
    },
    alreadyReject: {
        title: "Essa conta já foi rejeitada!",
    },
};

function ApprovalProfessional({ request, id }: Props) {
    const [findPerson, setFindPerson] = useState<boolean>(false);
    const [person, setPerson] = useState([]);

    async function requestApprovalDoctor() {
        try {
            const data = await getPersonById(Number(id));
            setPerson(data[0]);

            if (data) {
                setFindPerson(data[0][0].active);
            }

            if (!findPerson) {
                await requestApproval(String(id), String(request));
            }
        } catch (error: any) {
            if (typeof error?.response?.data?.error?.name === "string") {
                console.log(error?.response?.data?.error?.name);
            }
            setPerson([]);
        }
    }

    useEffect(() => {
        window.onload = () => {
            void requestApprovalDoctor();
        };
    }, [id]);

    return (
        <Flex
            w="full"
            h="100vh"
            direction="column"
            backgroundColor="white.10"
            alignItems="center"
            justifyContent="center"
        >
            <Flex position="relative" mb="20px">
                <Box
                    borderRadius={60}
                    w="120px"
                    h="120px"
                    bg="#D72A34"
                    opacity={0.1}
                ></Box>
                {request === "approved" ? (
                    <i
                        className="ri-check-line"
                        style={{
                            position: "absolute",
                            left: "8%",
                            top: "-12px",
                            color: "#D72A34",
                            fontSize: "100px",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    ></i>
                ) : (
                    <i
                        className="ri-close-line"
                        style={{
                            position: "absolute",
                            left: "8%",
                            top: "-12px",
                            color: "#D72A34",
                            fontSize: "100px",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    ></i>
                )}
            </Flex>
            <Text
                w={{ base: "80%", md: "100%" }}
                textAlign="center"
                fontSize="24px"
                fontWeight={900}
                lineHeight="130%"
                color="#202D46"
                mb={4}
            >
                {request === "approved"
                    ? findPerson
                        ? requests.alreadyApproved.title
                        : requests.approved.title
                    : person.length === 0
                    ? requests.alreadyReject.title
                    : requests.reject.title}
            </Text>
            <Text
                w={{ base: "80%", md: "600px" }}
                fontSize="16px"
                fontWeight={500}
                lineHeight="130%"
                textAlign="center"
                color="##202D46"
            >
                {request === "approved"
                    ? findPerson
                        ? null
                        : requests.approved.subtitle
                    : person.length === 0
                    ? null
                    : requests.reject.subtitle}
            </Text>

            <Image
                mt="32px"
                width="162px"
                src="/logo/mrd-logo-600px.png"
                alt="img"
            />
        </Flex>
    );
}

export default memo(ApprovalProfessional);
