import { Dispatch, SetStateAction, useState, useEffect } from "react";

type Response<Type> = [Type, Dispatch<SetStateAction<Type>>];

export function useStorageState<Type>(
    key: string,
    initialState: Type,
): Response<Type> {
    const getStorage = () => {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : initialState;
    };

    const [state, setState] = useState<Type>(getStorage);

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}
