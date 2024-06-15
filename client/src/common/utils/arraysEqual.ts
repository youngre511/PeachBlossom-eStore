// export const arraysEqual = (a: Array<string>, b: Array<string>): boolean => {
//     if (a === b) return true;
//     if (a == null || b == null) return false;

//     const sortedA = [...a].sort();
//     const sortedB = [...a].sort();

//     for (let i = 0; i < sortedA.length; i++) {
//         if (sortedA[i] !== sortedB[i]) return false;
//     }
//     return true;
// };

export function arraysEqual(
    a: (string | null)[],
    b: (string | null)[]
): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
