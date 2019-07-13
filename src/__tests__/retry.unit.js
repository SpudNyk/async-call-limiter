import lolex from 'lolex';
import retry from '../retry';

const failUntil = count => {
    const stop = count - 1;
    let run = 0;
    return async () => {
        if (run < stop) {
            run++;
            throw new Error('Failed');
        }
        return count;
    };
};

describe('retry', () => {
    let clock = null;
    beforeAll(() => {
        clock = lolex.install();
    });
    afterAll(() => {
        clock.uninstall();
    });
    const exhaustRetries = async count => {
        // specifically built for retry function (needs to await twice for each timer exhaustion)
        for (let i = 0; i < count; i++) {
            await Promise.resolve();
            clock.runAll();
            await Promise.resolve();
        }
    };
    it('fails after stopping', async () => {
        const result = retry(failUntil(11));
        await exhaustRetries(10);
        await expect(result).rejects.toThrow('Failed');
    });
    it('calls function every times before stopping', async () => {
        const fn = jest.fn(failUntil(11));
        const result = retry(fn, undefined, 10);
        await exhaustRetries(10);
        await expect(result).rejects.toThrow('Failed');
        expect(fn).toHaveBeenCalledTimes(10);
    });
    it('calls function until it succeeds', async () => {
        const fn = jest.fn(failUntil(5));
        const result = retry(fn, undefined, 10);
        await exhaustRetries(10);
        await expect(result).resolves.toBe(5);
        expect(fn).toHaveBeenCalledTimes(5);
    });
    it('can cancel', async () => {
        const fn = jest.fn(failUntil(9));
        const result = retry(fn, undefined, 10);
        result.cancel(new Error('testing cancel'));
        await exhaustRetries(5);
        expect(fn).toHaveBeenCalled();
        await expect(result).rejects.toThrow('testing cancel');
    });
    it('can cancel success', async () => {
        const fn = jest.fn(async () => true);
        const result = retry(fn, undefined, 10);
        result.cancel(new Error('testing cancel'));
        await exhaustRetries(5);
        expect(fn).toHaveReturned();
        await expect(result).rejects.toThrow('testing cancel');
    });
    it('can cancel after attempts', async () => {
        const fn = jest.fn(failUntil(9));
        const result = retry(fn, undefined, 10);
        await exhaustRetries(5);
        result.cancel(new Error('testing cancel'));
        expect(fn).toHaveBeenCalled();
        await expect(result).rejects.toThrow('testing cancel');
    });
    it('can use wait function after each attempt', async () => {
        const waitFn = jest.fn(attempt => 100);
        const result = retry(failUntil(10), waitFn, 10);
        await exhaustRetries(10);
        expect(waitFn).toHaveBeenCalledTimes(9);
        await result;
    });
    it('can use stop function after each attempt', async () => {
        const fn = jest.fn(failUntil(9));
        const stopFn = jest.fn(attempt => attempt > 5);
        const result = retry(fn, undefined, stopFn);
        await exhaustRetries(10);
        expect(fn).toHaveBeenCalledTimes(6);
        expect(stopFn).toHaveBeenCalledTimes(6);
        await expect(result).rejects.toThrow();
    });
});
