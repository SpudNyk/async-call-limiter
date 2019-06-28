import pending from './pending';

describe('pending', () => {
    it('completes with the correct value', async () => {
        const value = pending();
        value.complete(5);
        await expect(value.promise).resolves.toBe(5);
    });
    it('errors properly with a string', async () => {
        const value = pending();
        value.error('testing');
        await expect(value.promise).rejects.toBe('testing');
    });
    it('errors properly with an error', async () => {
        const value = pending();
        value.error(new Error('testing'));
        await expect(value.promise).rejects.toThrow('testing');
    });
    it('errors properly with an error value', async () => {
        const value = pending();
        value.error(123);
        await expect(value.promise).rejects.toBe(123);
    });
    it('cannot complete more than once', async () => {
        const value = pending();
        value.complete(5);
        expect(() => value.complete(3)).toThrow();
    });
    it('cannot complete after error', async () => {
        const value = pending();
        value.error(new Error('testing'));
        expect(() => value.complete(3)).toThrow();
        // consume the promise error
        await expect(value.promise).rejects.toThrow('testing');
    });
    it('cannot error more than once', async () => {
        const value = pending();
        value.error(new Error('testing'));
        expect(() => value.error('')).toThrow();
        // consume the promise error
        await expect(value.promise).rejects.toThrow('testing');
    });
    it('cannot error after complete', async () => {
        const value = pending();
        value.complete(5);
        expect(() => value.error('')).toThrow();
    });
});
