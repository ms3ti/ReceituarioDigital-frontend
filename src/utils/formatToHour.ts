export const formatToHour = (date: Date | string): string => {
    const objDate = new Date(date);

    const hourUnformated = objDate.getHours();
    const hour = hourUnformated <= 9 ? `0${hourUnformated}` : hourUnformated;

    const minuteUnformated = objDate.getMinutes();
    const minute =
        minuteUnformated <= 9 ? `0${minuteUnformated}` : minuteUnformated;

    return `${hour}:${minute}`;
};
