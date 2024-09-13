const monthArr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const keySort = (keyData: string[]) => {
    const parseCompoundValues = (value: string) => {
        let year = 0,
            quarter = 0,
            week = 0;

        if (value.includes("Q")) {
            const [q, y] = value.replace("Q", "").split(" ");
            year = Number(y);
            quarter = Number(q);
        } else if (value.includes("Week")) {
            const [_, w, y] = value.split(" ");
            year = Number(y);
            week = Number(w);
        }

        return { year, quarter, week };
    };

    const sortedKeys = keyData.sort((a: string, b: string) => {
        for (let i = 0; i < monthArr.length; i++) {
            if (a.includes(monthArr[i])) {
                a = a.replace(monthArr[i], `${i}`);
            }
            if (b.includes(monthArr[i])) {
                b = b.replace(monthArr[i], `${i}`);
            }
        }

        const aSplit = a.split(" ");
        if (aSplit.length > 1) {
            const aParsed = parseCompoundValues(a);
            const bParsed = parseCompoundValues(b);

            if (aParsed.year !== bParsed.year) {
                return aParsed.year - bParsed.year;
            } else if (aParsed.quarter !== bParsed.quarter) {
                return aParsed.quarter - bParsed.quarter;
            } else if (aParsed.week !== bParsed.week) {
                return aParsed.week - bParsed.week;
            }
        } else {
            if (
                (isNaN(Number(a)) && a < b) ||
                (!isNaN(Number(a)) && Number(a) - Number(b) < 0)
            ) {
                return -1;
            } else {
                return 1;
            }
        }

        return 0;
    });

    return sortedKeys;
};

export default keySort;
