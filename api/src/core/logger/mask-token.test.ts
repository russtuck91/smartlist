import maskToken from './mask-token';


describe('maskToken', () => {
    it('should mask the middle part', () => {
        const result = maskToken('BQB7ViitQHyFkxxMI_r3nN7tkjLhDHP2FzZ3ITTAKtPuULR0ObZ8HoYEnhYYWXWv91NgnEhehf8sGWqh-bH0Z4chKWad1vq1-d4IcFtVs-CKcX0qaGP9Z4p_vNT4RTRp2mDdRxzlmWvuuxhg7gLwjrjLJ2cPLerhC4FxYBjiDDnBeaoZpJKffk0WoyVUHiBT5A4ITZEusTqYJ2kBEkJ8qvGZXwvol7BVFxwYAloeX5oLrjQ2OV4CWZCf6YqRAnL2fgTyNbtEtaV9ygWQ');

        expect(result).toBe('BQB7Viit...taV9ygWQ');
    });
});
