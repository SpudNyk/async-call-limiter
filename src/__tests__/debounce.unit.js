import lolex from 'lolex';
import debounce from '../debounce';

describe('debounce', () => {
    let clock = null;
    beforeAll(() => {
        clock = lolex.install();
        clock.asyncTick = async v => {
            if (v) {
                clock.tick(v);
            }
            return true;
        };
    });
    afterAll(() => {
        clock.uninstall();
    });
    it('calls with the right argument', async () => {
        const debounced = debounce(arg => {
            expect(arg).toBe(5);
        }, 25);
        const result = debounced(5);
        await clock.asyncTick(25);
        await result;
    });
    it('uses with the latest argument', async () => {
        const debounced = debounce(arg => {
            expect(arg).toBe(6);
        }, 1);
        debounced(4);
        const result = debounced(6);
        clock.tick(25);
        await result;
    });
    it('calls the executor only after settling', async () => {
        const executor = jest.fn(() => null);
        const debounced = debounce(executor, 50, args => args);
        debounced(1);
        debounced(2);
        debounced(3);
        debounced(4);
        debounced(5);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.asyncTick(25);
        debounced(6);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.asyncTick(25);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.asyncTick(50);
        expect(executor).toHaveBeenCalledTimes(1);
    });
    it('calls the arguments reducer on every call', async () => {
        const reducer = jest.fn(args => args);
        const debounced = debounce(arg => arg, 1, reducer);
        debounced(1);
        debounced(2);
        debounced(3);
        debounced(4);
        debounced(5);
        clock.tick(25);
        expect(reducer).toHaveBeenCalledTimes(5);
    });
    it('uses the arguments reducer', async () => {
        const debounced = debounce(arg => arg, 1, ([current = 0], [num]) => [
            current + num
        ]);
        debounced(4);
        const result = debounced(6);
        clock.tick(25);
        await expect(result).resolves.toBe(10);
    });
    it('resets the arguments reducer between invocations', async () => {
        const debounced = debounce(arg => arg, 25, ([current = 0], [num]) => [
            current + num
        ]);
        debounced(4);
        const result = debounced(6);
        clock.tick(25);
        await expect(result).resolves.toBe(10);
        debounced(2);
        debounced(-20);
        const result2 = debounced(6);
        clock.tick(25);
        await expect(result2).resolves.toBe(-12);
    });
    it('returns the same value to multiple callers reducer', async () => {
        const debounced = debounce(arg => arg, 25);
        const values = [1, 2, 3, 4];
        const result = Promise.all(values.map(value => debounced(value)));
        clock.tick(25);
        await expect(result).resolves.toEqual([4, 4, 4, 4]);
    });
    it('forces a call after maxDelay', async () => {
        const executor = jest.fn(args => args);
        const debounced = debounce(executor, undefined, undefined, 100);
        debounced(1);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.asyncTick(25);
        debounced(2);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.asyncTick(25);
        debounced(3);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.asyncTick(25);
        debounced(4);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.asyncTick(25);
        debounced(5);
        expect(executor).toHaveBeenCalledTimes(1);
        await clock.asyncTick(200);
        debounced(6);
        expect(executor).toHaveBeenCalledTimes(2);
    });
    it('cancels', async () => {
        const executor = jest.fn(args => args);
        const debounced = debounce(executor, 50, undefined, 100);
        const result = debounced(1);
        await clock.asyncTick(25);
        debounced.cancel();
        expect(executor).toHaveBeenCalledTimes(0);
        await expect(result).rejects.toThrow();
    });
    it('cancels with reason', async () => {
        const executor = jest.fn(args => args);
        const debounced = debounce(executor, 50, undefined, 100);
        const result = debounced(1);
        debounced.cancel(new Error('cancel reason test'));
        await clock.asyncTick(25);
        expect(executor).toHaveBeenCalledTimes(0);
        await expect(result).rejects.toThrow('cancel reason test');
    });
    it('calls onCancel when cancelled', async () => {
        const executor = jest.fn(args => args);
        const onCancel = jest.fn(() => {});
        const debounced = debounce(executor, 50, undefined, 100, onCancel);
        const result = debounced(1);
        await clock.asyncTick(25);
        expect(onCancel).toHaveBeenCalledTimes(0);
        debounced.cancel();
        expect(executor).toHaveBeenCalledTimes(0);
        await expect(result).rejects.toThrow();
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
