import { times } from 'lodash';

import getFullPagedResults from './get-full-paged-results';


describe('getFullPagedResults', () => {
    const batchSize = 50;
    const mockSourceMethod = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should populate the items and run as many times as needed by the batch size', async () => {
        // Arrange
        const totalNumItems = 350;
        const expectedNumCalls = totalNumItems / batchSize;
        mockSourceMethod.mockResolvedValue({
            items: times(batchSize, Number),
            total: totalNumItems,
        });

        // Act
        const result = await getFullPagedResults(mockSourceMethod);

        // Assert
        expect(mockSourceMethod).toHaveBeenCalledTimes(expectedNumCalls);
        expect(result.items.length).toEqual(result.total);
    });

    it('should stop after receiving empty items array and false total', async () => {
        // Arrange
        const falseTotal = 64;
        const realTotal = 55;
        mockSourceMethod
            // default
            .mockResolvedValue({
                items: [],
                total: falseTotal,
            })
            // first call
            .mockResolvedValueOnce({
                items: times(batchSize, Number),
                total: falseTotal,
            })
            // second call
            .mockResolvedValueOnce({
                items: times(5, Number),
                total: falseTotal,
            });

        // Act
        const result = await getFullPagedResults(mockSourceMethod, 1000);

        // Assert
        expect(mockSourceMethod).toHaveBeenCalledTimes(2);
        expect(result.items.length).toEqual(realTotal);
        // disabled, pending investigation
        // expect(result.total).toEqual(realTotal);
    });
});
