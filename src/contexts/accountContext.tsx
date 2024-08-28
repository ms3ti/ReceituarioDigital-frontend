import React, { createContext, useContext, useState } from "react";

interface PropsAccountContext {
    name: string;
    setDoctorName: (name: string) => void;
    isChange: boolean;
    setIsChange: (name: boolean) => void;
    crm: string;
    setDoctorCRM: (name: string) => void;
    uf: string;
    setDoctorUf: (name: string) => void;
    councilId: string;
    setDoctorCouncilID: (name: string) => void;
}

interface ProviderProps {
    children: React.ReactNode;
}

export const AccountContext = createContext({} as PropsAccountContext);

export const AccountProvider = ({ children }: ProviderProps) => {
    const [name, setDoctorName] = useState<string>("");
    const [crm, setDoctorCRM] = useState<string>("");
    const [uf, setDoctorUf] = useState<string>("");
    const [councilId, setDoctorCouncilID] = useState<string>("");
    const [isChange, setIsChange] = useState<boolean>(false);
    return (
        <AccountContext.Provider
            value={{
                name,
                setDoctorName,
                isChange,
                setIsChange,
                crm,
                setDoctorCRM,
                uf,
                setDoctorUf,
                councilId,
                setDoctorCouncilID,
            }}
        >
            {children}
        </AccountContext.Provider>
    );
};

export function useAccount() {
    return useContext(AccountContext);
}
