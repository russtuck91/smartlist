


export function convertEnumToArray<T = string>(input: Record<string, T>): T[] {
    const arr: T[] = [];

    for (const key in input) {
        const value = input[key];
        arr.push(value);
    }

    return arr;
}

