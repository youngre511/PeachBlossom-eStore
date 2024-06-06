export const arraysEqual = (a: Array<string>, b: Array<string>): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;

    const sortedA = [...a].sort();
    const sortedB = [...a].sort();

    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) return false;
    }
    return true;
};
