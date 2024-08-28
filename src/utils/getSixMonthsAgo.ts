import { formatDateyyyyMMdd } from "./formatDateyyyyMMdd";

export const getSixMonthsAgo = (month: number) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - month);

    return formatDateyyyyMMdd(new Date(sixMonthsAgo).toString());
};
