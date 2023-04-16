import { times } from 'lodash';

import getFullPagedResults from './get-full-paged-results';


describe('getFullPagedResults', () => {
    const batchSize = 50;
    const mockSourceMethod = jest.fn();

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
});
