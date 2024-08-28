export const formatExtendedDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("pt-br", { month: "long" });
    const year = date.getFullYear();
    const hour = date.getHours();
    const minutes = date.getMinutes();

    const ninuteUnformated = minutes <= 9 ? `0${minutes}` : minutes;

    return `${day} de ${month} de ${year}, ${hour}:${ninuteUnformated}`;
};
