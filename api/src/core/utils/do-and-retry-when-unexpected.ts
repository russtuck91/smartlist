

async function doAndRetryWhenUnexpected<T>(
    bodyFn: () => Promise<T>,
    checkIfUnexpected: (result: T) => boolean,
    numRetries: number,
): Promise<T> {
    let remainingRuns = numRetries + 1;
    let result;
    while (remainingRuns > 0) {
        result = await bodyFn();
        const isUnexpected = checkIfUnexpected(result);
        if (!isUnexpected) {
            return result;
        }

        // decrement
        remainingRuns--;
    }
    return result;
}

export default doAndRetryWhenUnexpected;
