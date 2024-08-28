export const dateToSlash = (date: string): string => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};
