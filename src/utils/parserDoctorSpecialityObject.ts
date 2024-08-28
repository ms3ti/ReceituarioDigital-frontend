/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
interface arr {
    [x: number]: string | number;
    registrationNumber: string;
    specialty: string;
}

const registrationNumberBase = "registrationNumber";
const specialtyBase = "specialty";

export const parserDoctorSpecialityObject = (obj: any, length: number) => {
    const arr: arr[] = [];

    for (const prop of Object.keys(obj)) {
        if (prop.includes(registrationNumberBase)) {
            const [, index] = prop.split(registrationNumberBase);
            if (
                arr[Number(index) - 1]?.hasOwnProperty(registrationNumberBase)
            ) {
                arr[Number(index) - 1].registrationNumber = obj[prop];
            } else {
                arr[Number(index) - 1] = {
                    registrationNumber: obj[prop],
                    specialty: "",
                };
            }
        } else {
            const [, index] = prop.split(specialtyBase);
            if (arr[Number(index) - 1]?.hasOwnProperty(specialtyBase)) {
                arr[Number(index) - 1].specialty = obj[prop];
            } else {
                arr[Number(index) - 1] = {
                    registrationNumber: "",
                    specialty: obj[prop],
                };
            }
        }
    }
    return arr.slice(0, length);
};
