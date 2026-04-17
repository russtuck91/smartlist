async function batchProcess<T>({
    fetchBatch,
    processBatch,
    batchSize,
    offset = 0,
}: {
    fetchBatch: (offset: number) => Promise<T[]>,
    processBatch: (batch: T[]) => Promise<void>,
    batchSize: number,
    offset?: number,
}): Promise<void> {
    const batch = await fetchBatch(offset);
    if (!batch.length) return;
    await processBatch(batch);
    if (batch.length === batchSize) {
        await batchProcess({ fetchBatch, processBatch, batchSize, offset: offset + batchSize });
    }
}

export default batchProcess;
