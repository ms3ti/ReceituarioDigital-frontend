import { Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";

export default function BackButton() {
    const navigate = useNavigate();
    const [doctorId, setDoctorId] = useState("");
    async function getDoctorId() {
        const id = await asyncLocalStorage.getItem(localStorageKeys.DOCTOR_ID);
        setDoctorId(String(id));
    }
    useEffect(() => {
        void getDoctorId();
    }, []);
    return (
        <Flex
            _hover={{ cursor: "pointer" }}
            onClick={() => {
                navigate(`/showPrescriptions/${doctorId}`);
            }}
        >
            <i
                className="ri-arrow-go-back-line"
                style={{ color: "#3E4C62", fontSize: "14px" }}
            ></i>
            <Text
                textDecoration="underline"
                color="#3E4C62"
                marginLeft="10px"
                fontSize="14px"
            >
                Voltar ao início
            </Text>
        </Flex>
    );
}
