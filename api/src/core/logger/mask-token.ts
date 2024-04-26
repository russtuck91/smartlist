
function maskToken(input: string) {
    const firstPart = input.slice(0, 8);
    const lastPart = input.slice(-8);
    return `${firstPart}...${lastPart}`;
}

export default maskToken;
