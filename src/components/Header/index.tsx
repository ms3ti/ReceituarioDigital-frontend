import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Flex,
    Text,
    Image,
    useMediaQuery,
} from "@chakra-ui/react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ShowInfoModal } from "../ShowInfoModal";
import { useAccount } from "../../contexts/accountContext";
import { ListAddress } from "../ListAddress";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { ChangePassword } from "../ChangePassword";
import { getAdminByPersonId } from "../../services/getAdminByPersonId";
import { Button } from "../Button/index";

interface Props {
    id: number;
}

export function Header({ id }: Props) {
    const account = useAccount();
    const navigate = useNavigate();
    const location = useLocation();
    const isLoginPage = location.pathname === "/";
    const [isLargerThan800] = useMediaQuery("(min-width: 800px)");
    const [personType, setpersonType] = useState<number>();
    const [doctorName, setDoctorName] = useState("");
    const [docEmail, setDocEmail] = useState("");

    async function getInfo() {
        const personType = await asyncLocalStorage.getItem(
            localStorageKeys.PERSON_TYPE,
        );
        const docName = await asyncLocalStorage.getItem(
            localStorageKeys.DOCTOR_NAME,
        );
        const docCRM = await asyncLocalStorage.getItem(localStorageKeys.CRM);
        const councilId = await asyncLocalStorage.getItem(
            localStorageKeys.COUNCIL_ID,
        );
        const personId = await asyncLocalStorage.getItem(
            localStorageKeys.PERSON_ID,
        );
        const doc = await getAdminByPersonId(
            Number(personId?.replaceAll('"', "")),
        );
        setpersonType(Number(personType?.replaceAll('"', "")));
        setDocEmail(doc?.email);

        setDoctorName(String(docName));
        account.setDoctorName(String(docName));
        account.setDoctorCRM(String(`${docCRM}`).replaceAll('"', ""));
        account.setDoctorCouncilID(String(councilId).replaceAll('"', ""));
    }

    async function deleteToken(): Promise<void> {
        await asyncLocalStorage.clearAll();
        navigate("/");
    }
    useEffect(() => {
        void getInfo();
    }, []);
    return (
        <React.Fragment>
            {!isLoginPage ? (
                <>
                    <Container
                        w={{ base: "100%", md: "100%" }}
                        maxWidth="100%"
                        borderBottom="1px solid #EDEDF3"
                    >
                        <Container
                            w={{ base: "100%", md: "1000px" }}
                            maxWidth="100%"
                        >
                            <Flex
                                flexDirection="row"
                                justifyContent="space-between"
                                paddingTop="13px"
                                paddingBottom="13px"
                            >
                                <Box boxSize="50%">
                                    <Link
                                        to={
                                            personType === 3
                                                ? "/admin"
                                                : `/showPrescriptions/${id}`
                                        }
                                    >
                                        <Image
                                            width={
                                                isLargerThan800
                                                    ? "165px"
                                                    : "55px"
                                            }
                                            src={
                                                isLargerThan800
                                                    ? "/logo/mrd-logo.svg"
                                                    : "/logo/mrd-logo-icon.svg"
                                            }
                                            alt="Meu receituario digital logo"
                                        />
                                    </Link>
                                </Box>
                                {personType === 3 ? (
                                    <Flex
                                        direction="column"
                                        alignItems="self-end"
                                    >
                                        <Text>{doctorName}</Text>
                                        <Flex>
                                            <ChangePassword
                                                email={docEmail}
                                                isAdminList
                                            />

                                            <Button
                                                width="70px"
                                                type="submit"
                                                height="30px"
                                                onClick={() =>
                                                    // eslint-disable-next-line no-void
                                                    void deleteToken()
                                                }
                                                text="Sair"
                                                textColor="red"
                                                bgColor="#FFFF"
                                                icon={
                                                    <i className="ri-logout-box-r-line"></i>
                                                }
                                                variant={"outline"}
                                                hasIcon
                                                maxWidth="238px"
                                                borderRadius="5px"
                                                fontSize={12}
                                            />
                                        </Flex>
                                    </Flex>
                                ) : null}

                                {account.name.length > 0 && personType !== 3 ? (
                                    <ShowInfoModal
                                        showAvatar
                                        doctorId={Number(id)}
                                    />
                                ) : null}
                            </Flex>
                        </Container>
                    </Container>
                    {personType !== 3 ? <ListAddress /> : null}
                </>
            ) : (
                <React.Fragment></React.Fragment>
            )}
        </React.Fragment>
    );
}
