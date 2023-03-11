


jest.mock('react-ga4');

// Export empty object to adhere to isolatedModules flag. ts(1208)
// If this file ever imports or exports something real, then this can be removed.
export {};
