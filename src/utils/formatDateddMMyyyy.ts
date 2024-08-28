export const formatDateddMMyyyy = (date: Date | string) => {
    const objDate = new Date(date);

    const monthUnformated = objDate.getMonth() + 1;
    const dayUnformated = objDate.getDate();
    const month =
        monthUnformated <= 9 ? `0${monthUnformated}` : monthUnformated;
    const day = dayUnformated <= 9 ? `0${dayUnformated}` : dayUnformated;

    const result = `${day}/${month}/${objDate.getFullYear()}`;

    return result;
};
