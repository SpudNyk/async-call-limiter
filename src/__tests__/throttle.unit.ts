import ft from '@sinonjs/fake-timers';
import throttle from '../throttle';
type NumArgs = Parameters<(num: number) => {}>;

describe('throttle', () => {
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
        const throttled = throttle(arg => {
            expect(arg).toBe(5);
        }, 25);
        const result = throttled(5);
        await clock.tickAsync(25);
        await result;
    });
    it('uses with the latest argument', async () => {
        const throttled = throttle(arg => {
            expect(arg).toBe(6);
        }, 1);
        throttled(4);
        const result = throttled(6);
        clock.tick(25);
        await result;
    });
    it('calls the executor next tick after delay since last call', async () => {
        const executor = jest.fn(() => null);
        const throttled = throttle(executor, 50);
        expect(executor).toHaveBeenCalledTimes(0);
        // prime the throttle
        throttled();
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(1);
        expect(executor).toHaveBeenCalledTimes(1);
        await clock.tickAsync(100);
        expect(executor).toHaveBeenCalledTimes(1);
        // recall should happen right away
        throttled();
        expect(executor).toHaveBeenCalledTimes(1);
        await clock.tickAsync(1);
        expect(executor).toHaveBeenCalledTimes(2);
    });
    it('calls the executor in appropriate intervals', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const executor = jest.fn((x: number) => null);
        const throttled = throttle(executor, 50);
        expect(executor).toHaveBeenCalledTimes(0);
        let calls = 0;
        // prime the throttle
        throttled(-1);
        expect(executor).toHaveBeenCalledTimes(calls);
        await clock.tickAsync(1);
        calls++;
        expect(executor).toHaveBeenCalledTimes(calls);
        for (let i = 0; i < 10; i++) {
            throttled(i);
            await clock.tickAsync(20);
            throttled(i);
            // not longer than delay has passed so should have been called
            expect(executor).toHaveBeenCalledTimes(calls);
            throttled(i);
            await clock.tickAsync(20);
            throttled(i);
            // not longer than delay has passed so should have been called
            expect(executor).toHaveBeenCalledTimes(calls);
            await clock.tickAsync(10);
            calls++;
            expect(executor).toHaveBeenCalledTimes(calls);
        }
    });
    it('calls the arguments reducer on every call', async () => {
        const reducer = jest.fn(args => args);
        const throttled = throttle(arg => arg, 1, { reducer });
        throttled(1);
        throttled(2);
        throttled(3);
        throttled(4);
        throttled(5);
        clock.tick(25);
        expect(reducer).toHaveBeenCalledTimes(5);
    });
    it('uses the arguments reducer', async () => {
        const throttled = throttle((arg: number): number => arg, 20, {
            reducer: ([current = 0]: [number], [num]: NumArgs) => [
                current + num
            ]
        });
        throttled(4);
        const result = throttled(6);
        clock.tick(25);
        await expect(result).resolves.toBe(10);
    });
    it('resets the arguments reducer between invocations', async () => {
        const throttled = throttle((arg: number): number => arg, 25, {
            reducer: ([current = 0], [num]: NumArgs) => [current + num]
        });
        throttled(4);
        const result = throttled(6);
        clock.tick(25);
        await expect(result).resolves.toBe(10);
        throttled(2);
        throttled(-20);
        const result2 = throttled(6);
        clock.tick(25);
        await expect(result2).resolves.toBe(-12);
    });
    it('returns the same value to multiple callers reducer', async () => {
        const throttled = throttle(arg => arg, 25);
        const values = [1, 2, 3, 4];
        const result = Promise.all(values.map(value => throttled(value)));
        clock.tick(25);
        await expect(result).resolves.toEqual([4, 4, 4, 4]);
    });
    it('implements maxCalls', async () => {
        const executor = jest.fn(args => args);
        const throttled = throttle(executor, 50, {
            reducer: ([count]) => [count === undefined ? 1 : count + 1],
            maxCalls: 5
        });
        const first = throttled();
        let final;
        for (let i = 0; i < 20; i++) {
            final = throttled();
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
        const throttled = throttle(executor, 50, {
            reducer: ([count]) => [count === undefined ? 1 : count + 1]
        });
        const first = throttled();
        throttled.flush();
        const second = throttled();
        throttled();
        throttled();
        throttled.flush();
        const third = throttled();
        throttled();
        await clock.tickAsync(0);
        await expect(first).resolves.toBe(1);
        await expect(second).resolves.toBe(3);
        await clock.tickAsync(50);
        await expect(third).resolves.toBe(2);
        expect(executor).toHaveBeenCalledTimes(3);
    });
    it('cancels', async () => {
        const executor = jest.fn(args => args);
        const throttled = throttle(executor, 50);
        throttled(1);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(1);
        const result = throttled(2);
        const done = expect(result).rejects.toThrow();
        throttled.cancel();
        await clock.tickAsync(25);
        await done;
    });
    it('cancels with reason', async () => {
        const executor = jest.fn(args => args);
        const throttled = throttle(executor, 50);
        const result = throttled(1);
        const done = expect(result).rejects.toThrow('cancel reason test');
        throttled.cancel(new Error('cancel reason test'));
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(0);
        await done;
    });
});
