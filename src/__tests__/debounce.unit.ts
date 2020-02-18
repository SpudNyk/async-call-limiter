/* eslint-disable @typescript-eslint/no-empty-function */
import ft from '@sinonjs/fake-timers';
import debounce from '../debounce';

describe('debounce', () => {
    let clock;
    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        clock = ft.install({ now: Date.now() });
    });
    afterAll(() => {
        clock.uninstall();
    });
    it('calls with the right argument', async () => {
        const debounced = debounce(arg => {
            expect(arg).toBe(5);
        }, 25);
        const result = debounced(5);
        await clock.tickAsync(25);
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
        const debounced = debounce(executor, 50, {
            reducer: args => args
        });
        debounced(1);
        debounced(2);
        debounced(3);
        debounced(4);
        debounced(5);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        // reset the delay
        debounced(6);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(0);
        debounced(7);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(0);
        debounced(8);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(0);
        // let it settle
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(1);
        // reset the delay
        debounced(9);
        expect(executor).toHaveBeenCalledTimes(1);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(1);
        debounced(10);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(1);
        debounced(11);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(1);
        // let it settle
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(2);
    });
    it('calls the arguments reducer on every call', async () => {
        const reducer = jest.fn(args => args);
        const debounced = debounce(arg => arg, 1, { reducer });
        debounced(1);
        debounced(2);
        debounced(3);
        debounced(4);
        debounced(5);
        clock.tick(25);
        expect(reducer).toHaveBeenCalledTimes(5);
    });
    it('uses the arguments reducer', async () => {
        const ident = (x: number): number => x;
        const debounced = debounce(ident, 1, {
            reducer: (
                [current = 0]: [number],
                [num]: Parameters<(num: number) => {}>
            ) => [current + num]
        });
        debounced(5);
        const result = debounced(6);
        clock.tick(25);
        await expect(result).resolves.toBe(11);
    });
    it('resets the arguments reducer between invocations', async () => {
        const ident = (x: number): number => x;
        const debounced = debounce(ident, 25, {
            reducer: (
                [current = 0],
                [num]: Parameters<(num: number) => {}>
            ) => [current + num]
        });
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
        const debounced = debounce(executor, 50, {
            maxDelay: 100
        });
        debounced(1);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        debounced(2);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        debounced(3);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        debounced(4);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        debounced(5);
        expect(executor).toHaveBeenCalledTimes(1);
        await clock.tickAsync(200);
        debounced(6);
        expect(executor).toHaveBeenCalledTimes(2);
    });
    it('implements maxCalls', async () => {
        const executor = jest.fn(args => args);
        const debounced = debounce(executor, 50, {
            reducer: ([count]) => [count === undefined ? 1 : count + 1],
            maxCalls: 5
        });
        const first = debounced();
        let final;
        for (let i = 0; i < 20; i++) {
            final = debounced();
        }
        await clock.tickAsync(0);
        await expect(first).resolves.toBe(5);
        await clock.tickAsync(50);
        expect(final).resolves.toBe(1);
        await final;
        expect(executor).toHaveBeenCalledTimes(5);
    });
    it('implements flush', async () => {
        const executor = jest.fn(args => args);
        const debounced = debounce(executor, 50, {
            reducer: ([count]) => [count === undefined ? 1 : count + 1]
        });
        const first = debounced();
        debounced.flush();
        const second = debounced();
        debounced();
        debounced();
        debounced.flush();
        const third = debounced();
        debounced();
        await clock.tickAsync(0);
        await expect(first).resolves.toBe(1);
        await expect(second).resolves.toBe(3);
        await clock.tickAsync(50);
        await expect(third).resolves.toBe(2);
        expect(executor).toHaveBeenCalledTimes(3);
    });
    it('cancels', async () => {
        const executor = jest.fn(args => args);
        const debounced = debounce(executor, 50, { maxDelay: 100 });
        const result = debounced(1);
        const done = expect(result).rejects.toThrow();
        await clock.tickAsync(25);
        debounced.cancel();
        expect(executor).toHaveBeenCalledTimes(0);
        await done;
    });
    it('cancels with reason', async () => {
        const executor = jest.fn(args => args);
        const debounced = debounce(executor, 50, { maxDelay: 100 });
        const result = debounced(1);
        const done = expect(result).rejects.toThrow('cancel reason test');
        debounced.cancel(new Error('cancel reason test'));
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(0);
        await done;
    });
    it('calls onCancel when cancelled', async () => {
        const executor = jest.fn(args => args);
        const onCancel = jest.fn(() => {});
        const debounced = debounce(executor, 50, { maxDelay: 100, onCancel });
        const result = debounced(1);
        const done = expect(result).rejects.toThrow();
        await clock.tickAsync(25);
        expect(onCancel).toHaveBeenCalledTimes(0);
        debounced.cancel();
        expect(executor).toHaveBeenCalledTimes(0);
        expect(onCancel).toHaveBeenCalledTimes(1);
        await done;
    });
});
