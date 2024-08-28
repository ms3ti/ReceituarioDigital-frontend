import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../../components";
import {
    Text,
    Box,
    Flex,
    List,
    Menu,
    MenuButton,
    MenuList,
    ListItem,
} from "@chakra-ui/react";
import { blockUser } from "../../services/blockUser";
import { formatToCPF } from "brazilian-values";
import { differenceInDays } from "date-fns";
import { updatePlan } from "../../services/updatePlan";
import { DeleteDoctorModal } from "../DeleteDoctorModal/index";
import EditDoctor from "../EditDoctor/index";
import { approveDoctor } from '../../services/approveDoctor';

interface Props {
    name: string;
    cpf: string;
    active: boolean;
    id: number;
    searchValue: string;
    findDoctor: (cpf: string) => Promise<void>;
    doctorId: number;
    plan: string;
    datePlan: string;
    setSearchWord: Dispatch<SetStateAction<string>>;
}

export function UserToBlock({
    active,
    cpf,
    name,
    id,
    findDoctor,
    searchValue,
    doctorId,
    plan,
    datePlan,
    setSearchWord,
}: Props) {


    const [loadingApprove, setLoadingApprove] = useState(false)
    const [loadingReject, setLoadingloadingReject] = useState(false)

    const Lock = () => (
        <i className={active ? "ri-lock-line" : "ri-lock-unlock-line"}></i>
    );

    async function updateActiveDoctor() {
        await blockUser(id);
        await findDoctor(searchValue);
    }

    async function updatePlanActiveDoctor() {
        await updatePlan(doctorId);
        await findDoctor(searchValue);
    }

    async function approveRejectDoctor(action: string) {
        if (action === 'approved') { 
            setLoadingApprove(true);
            setLoadingloadingReject(false);
        } else {
            setLoadingApprove(false);
            setLoadingloadingReject(true);
        }
        await approveDoctor(id, action);
        await findDoctor(searchValue);
        setLoadingloadingReject(false)
        setLoadingApprove(false)
    }

    return (
        <Box
            padding="15px"
            width="100%"
            height="auto"
            minH="79px"
            borderRadius={4}
            border="1px solid #EDEDF3"
            my={2}
            onClick={() => {}}
            _hover={{
                cursor: "pointer",
                backgroundColor: "white.200",
            }}
        >
            <Flex
                direction="column"
                minHeight="30px"
                justifyContent={{
                    base: "flex-evenly",
                    md: "space-evenly",
                }}
                alignItems={{
                    base: "flex-evenly",
                    md: "space-evenly",
                }}
            >
                <Text color="#7D899D" fontSize="11px">
                    {plan === "trail"
                        ? "TRAIL"
                        : plan === "plan_1"
                        ? "ATIVO"
                        : "BLOQUEADO"}
                </Text>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    minHeight="47px"
                    justifyContent={{
                        base: "flex-evenly",
                        md: "space-evenly",
                    }}
                    alignItems={{
                        base: "flex-evenly",
                        md: "space-evenly",
                    }}
                >
                    <Text width="100%" fontWeight={900} my={1}>
                        {name}
                        <Text fontWeight={500} color="#3E4C62" fontSize="14px">
                            {formatToCPF(cpf)}
                        </Text>
                    </Text>

                    <Text width="100%" my={1}>
                        {plan === "plan_1" || plan === "blocked" || !active
                            ? null
                            : differenceInDays(
                                new Date(datePlan),
                                new Date(),
                              ) === 0
                            ? null
                            : `${differenceInDays(
                                    new Date(datePlan),
                                    new Date(),
                              )} ${
                                  differenceInDays(
                                      new Date(datePlan),
                                      new Date(),
                                  ) === 1
                                      ? `dia`
                                      : `dias`
                              } para expirar`}

                        {!active && plan === "trail" ? (
                            <Text>Aguardando aprovação</Text>
                        ) : null}
                    </Text>
                    <Flex
                        direction={"row"}
                        width={{ base: "100%", md: "250px" }}
                        justifyContent="center"
                    >

                        {!active && plan === "trail" ? (
                            
                            <><Button
                                width={"100%"}
                                height={"47px"}
                                variant="outline"
                                text={"Aprovar"}
                                bgColor={"#D72A34"}
                                textColor="#F7F8FA"
                                onClick={() => approveRejectDoctor('approved')}
                                hasIcon
                                borderColor="rgba(215, 42, 52, 0.2)"
                                border="2px"
                                fontSize={14}
                                icon={<Lock />}
                                isLoading={loadingApprove}
                                disable={loadingApprove}
                            />
                            <Button
                                width={"100%"}
                                height={"47px"}
                                variant="outline"
                                text={"Rejeitar"}
                                bgColor={"#F7F8FA"}
                                textColor="#D72A34"
                                onClick={() => approveRejectDoctor('rejected')}
                                hasIcon
                                borderColor="rgba(215, 42, 52, 0.2)"
                                border="2px"
                                fontSize={14}
                                icon={<Lock />}
                                isLoading={loadingReject}
                                disable={loadingReject}
                                />
                                </>
                        ) : null}

                        {active && plan === "trail" ? (
                            <Button
                                width={"100%"}
                                height={"47px"}
                                variant="outline"
                                text={"Garantir acesso"}
                                bgColor={"#D72A34"}
                                textColor="#F7F8FA"
                                onClick={updatePlanActiveDoctor}
                                hasIcon
                                borderColor="rgba(215, 42, 52, 0.2)"
                                border="2px"
                                fontSize={14}
                                icon={<Lock />}
                            />
                        ) : null}

                        {active && plan === "plan_1" ? (
                            <Button
                                width={"100%"}
                                height={"47px"}
                                variant="outline"
                                text={"Bloquear"}
                                bgColor={"#D72A34"}
                                textColor="#F7F8FA"
                                onClick={updateActiveDoctor}
                                hasIcon
                                borderColor="rgba(215, 42, 52, 0.2)"
                                border="2px"
                                fontSize={14}
                                icon={<Lock />}
                            />
                        ) : null}

                        {!active && plan === "blocked" ? (
                            <Button
                                width={"100%"}
                                height={"47px"}
                                variant="outline"
                                text={"Desbloquear"}
                                bgColor={"#D72A34"}
                                textColor="#F7F8FA"
                                onClick={updateActiveDoctor}
                                hasIcon
                                borderColor="rgba(215, 42, 52, 0.2)"
                                border="2px"
                                fontSize={14}
                                icon={<Lock />}
                            />
                        ) : null}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                minWidth: "47px",
                                width: "47px",
                                height: "47px",
                                margin: 0,
                                padding: 0,
                                backgroundColor: "white",
                                borderRadius: 4,
                                borderWidth: 1,
                                borderColor: "#EDEDF3",
                                color: "#7D899D",
                            }}
                        >
                            <Menu>
                                <MenuButton
                                    backgroundColor="transparent"
                                    _hover={{
                                        background: "white",
                                    }}
                                    _active={{
                                        background: "white",
                                    }}
                                >
                                    <i className="ri-more-fill"></i>
                                </MenuButton>
                                <MenuList
                                    border="none"
                                    zIndex={9}
                                    minW="0"
                                    w="180px"
                                    borderRadius="12px"
                                    boxShadow="0px 3px 15px rgba(7, 106, 235, 0.1)"
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            flexDirection: "column",
                                            width: "100%",
                                            margin: 0,
                                            padding: 0,
                                        }}
                                    >
                                        <List>
                                            <ListItem
                                                _hover={{
                                                    background: "gray.500",
                                                }}
                                                _active={{
                                                    background: "gray.500",
                                                }}
                                                borderBottom="1px"
                                                borderBottomColor="gray.500"
                                            >
                                                <DeleteDoctorModal
                                                    id={id}
                                                    setSearchWord={
                                                        setSearchWord
                                                    }
                                                />
                                            </ListItem>
                                            <ListItem
                                                _hover={{
                                                    background: "white",
                                                }}
                                                _active={{
                                                    background: "white",
                                                }}
                                            >
                                                <EditDoctor
                                                    doctorId={doctorId}
                                                    setDoctor={() => {}}
                                                    isAdminEdit={false}
                                                />
                                            </ListItem>
                                        </List>
                                    </div>
                                </MenuList>
                            </Menu>
                        </div>
                        {/* </Box> */}
                    </Flex>
                </Flex>
            </Flex>
        </Box>
    );
}
