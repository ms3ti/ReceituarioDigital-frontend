export const formatDateSimple = (date: string) => {
    const todayDate = new Date();
    const dateObject = new Date(date);
    const today = `${todayDate.getDate()}/${todayDate.toLocaleString(
        "pt-br",
        {
            month: "long",
        },
    )}`;
    const dateOfObject = `${dateObject.getDate()}/${dateObject.toLocaleString(
        "pt-br",
        { month: "long" },
    )}`;
    const monthObject = dateObject.toLocaleString("pt-br", { month: "long" });

    if (today === dateOfObject) {
        return `Hoje, ${dateObject.getDate()}/${monthObject[0].toLocaleUpperCase()}${
            monthObject[1]
        }${monthObject[2]}`;
    }
    const isYesterday = todayDate.getDate() - dateObject.getDate();
    if (
        isYesterday === 1 &&
        todayDate.getMonth() === dateObject.getMonth()
    ) {
        return `Ontem, ${dateObject.getDate()}/${monthObject[0].toLocaleUpperCase()}${
            monthObject[1]
        }${monthObject[2]}`;
    }

    return `${dateObject.getDate()}/${monthObject[0].toLocaleUpperCase()}${
        monthObject[1]
    }${monthObject[2]}`;
};
