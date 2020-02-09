
export const objectUtil = {
    convertEnumToArray: convertEnumToArray
};


function convertEnumToArray<T = string>(input: object): T[] {
    const arr: T[] = [];

    for (var key in input) {
        const value = input[key];
        arr.push(value);
    }

    return arr;
}

