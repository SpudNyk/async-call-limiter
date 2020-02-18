import ft from '@sinonjs/fake-timers';
import retry from '../retry';

const failUntil = (count: number): (() => number) => {
    const stop = count - 1;
    let run = 0;
    return (): number => {
        if (run < stop) {
            run++;
            throw new Error('Failed');
        }
        return count;
    };
};

describe('retry', () => {
    let clock: ft.InstalledClock;
    beforeAll(() => {
        clock = ft.install();
    });
    afterAll(() => {
        clock.uninstall();
    });
    const exhaustRetries = async (count: number): Promise<void> => {
        // specifically built for retry function (needs to await twice for each timer exhaustion)
        for (let i = 0; i < count; i++) {
            // await Promise.resolve();
            // clock.runAll();
            // await Promise.resolve();
            await clock.nextAsync();
        }
    };
    it('fails after stopping', async () => {
        const result = retry(failUntil(11));
        const done = expect(result).rejects.toThrow('Stopped');
        await exhaustRetries(10);
        await done;
    });
    it('calls function every times before stopping', async () => {
        const fn = jest.fn(failUntil(11));
        const result = retry(fn, undefined, 10);
        const done = expect(result).rejects.toThrow('Stopped');
        await exhaustRetries(10);
        await done;
        expect(fn).toHaveBeenCalledTimes(10);
    });
    it('calls function until it succeeds', async () => {
        const fn = jest.fn(failUntil(5));
        const result = retry(fn, undefined, 10);
        const done = expect(result).resolves.toBe(5);
        await exhaustRetries(10);
        await done;
        expect(fn).toHaveBeenCalledTimes(5);
        expect(fn).toReturnTimes(1);
    });
    it('can cancel', async () => {
        const fn = jest.fn(failUntil(9));
        const result = retry(fn, undefined, 10);
        const done = expect(result).rejects.toThrow('testing cancel');
        result.cancel('testing cancel');
        await exhaustRetries(5);
        await done;
    });
    it('can cancel after attempts', async () => {
        const fn = jest.fn(failUntil(9));
        const result = retry(fn, undefined, 10);
        const done = expect(result).rejects.toThrow('testing cancel');
        await exhaustRetries(5);
        result.cancel('testing cancel');
        expect(fn).toHaveBeenCalled();
        expect(fn).not.toReturn();
        await exhaustRetries(5);
        await done;
    });
    it('calls the wait function after each attempt', async () => {
        const waitFn = jest.fn(() => 100);
        const done = retry(failUntil(10), waitFn, 10);
        await exhaustRetries(10);
        await done;
        expect(waitFn).toHaveBeenCalledTimes(9);
    });
    it('calls the stop function after each attempt', async () => {
        const fn = jest.fn(failUntil(9));
        const stopFn = jest.fn(attempt => attempt > 5);
        const result = retry(fn, undefined, stopFn);
        const done = expect(result).rejects.toThrow();
        await exhaustRetries(10);
        await done;
        expect(fn).toHaveBeenCalledTimes(6);
        expect(stopFn).toHaveBeenCalledTimes(6);
    });
});
