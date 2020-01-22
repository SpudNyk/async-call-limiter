import lolex from 'lolex';
import throttle from '../throttle';
type NumArgs = Parameters<(num: number) => {}>;
type AsyncInstalledClock = lolex.InstalledClock & {
    asyncTick(v?: string | number): Promise<boolean>;
};

describe('throttle', () => {
    let clock: AsyncInstalledClock;
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
        const throttled = throttle(arg => {
            expect(arg).toBe(5);
        }, 25);
        const result = throttled(5);
        await clock.asyncTick(25);
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
        await clock.asyncTick(1);
        expect(executor).toHaveBeenCalledTimes(1);
        await clock.asyncTick(100);
        expect(executor).toHaveBeenCalledTimes(1);
        // recall should happen right away
        throttled();
        expect(executor).toHaveBeenCalledTimes(1);
        await clock.asyncTick(1);
        expect(executor).toHaveBeenCalledTimes(2);
    });
    it('calls the executor in appropriate intervals', async () => {
        const executor = jest.fn((x: number) => null);
        const throttled = throttle(executor, 50);
        expect(executor).toHaveBeenCalledTimes(0);
        let calls = 0;
        // prime the throttle
        throttled(-1);
        expect(executor).toHaveBeenCalledTimes(calls);
        await clock.asyncTick(1);
        calls++;
        expect(executor).toHaveBeenCalledTimes(calls);
        for (let i = 0; i < 10; i++) {
            throttled(i);
            await clock.asyncTick(20);
            throttled(i);
            // not longer than delay has passed so should have been called
            expect(executor).toHaveBeenCalledTimes(calls);
            throttled(i);
            await clock.asyncTick(20);
            throttled(i);
            // not longer than delay has passed so should have been called
            expect(executor).toHaveBeenCalledTimes(calls);
            await clock.asyncTick(10);
            calls++;
            expect(executor).toHaveBeenCalledTimes(calls);
        }
    });
    it('calls the arguments reducer on every call', async () => {
        const reducer = jest.fn(args => args);
        const throttled = throttle(arg => arg, 1, reducer);
        throttled(1);
        throttled(2);
        throttled(3);
        throttled(4);
        throttled(5);
        clock.tick(25);
        expect(reducer).toHaveBeenCalledTimes(5);
    });
    it('uses the arguments reducer', async () => {
        const throttled = throttle(
            (arg: number): number => arg,
            20,
            ([current = 0]: [number], [num]: NumArgs) => [current + num]
        );
        throttled(4);
        const result = throttled(6);
        clock.tick(25);
        await expect(result).resolves.toBe(10);
    });
    it('resets the arguments reducer between invocations', async () => {
        const throttled = throttle(
            (arg: number): number => arg,
            25,
            ([current = 0], [num]: NumArgs) => [current + num]
        );
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
    it('cancels', async () => {
        const executor = jest.fn(args => args);
        const throttled = throttle(executor, 50);
        throttled(1);
        await clock.asyncTick(25);
        expect(executor).toHaveBeenCalledTimes(1);
        const result2 = throttled(2);
        throttled.cancel();
        await clock.asyncTick(25);
        await expect(result2).rejects.toThrow();
    });
    it('cancels with reason', async () => {
        const executor = jest.fn(args => args);
        const throttled = throttle(executor, 50);
        const result = throttled(1);
        throttled.cancel(new Error('cancel reason test'));
        await clock.asyncTick(25);
        expect(executor).toHaveBeenCalledTimes(0);
        await expect(result).rejects.toThrow('cancel reason test');
    });
});
