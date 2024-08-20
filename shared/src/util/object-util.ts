


export function convertEnumToArray<T = string>(input: Record<string, T>): T[] {
    const arr = Object.values(input);

    return arr;
}

