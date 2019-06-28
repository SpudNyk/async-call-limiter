import lolex from 'lolex';
import delay from './delay';

describe('delay', () => {
    let clock = null;
    beforeAll(() => {
        clock = lolex.install();
        clock.asyncTick = async (v) => {
            if (v) {
                clock.tick(v);
            }
            return true;
        }
    });
    afterAll(() => {
        clock.uninstall();
    });
    it('resolves after the delay', async () => {
        const then = jest.fn(v => v);
        const result = delay(24, 50);
        result.then(then);
        await clock.asyncTick();
        expect(then).toHaveBeenCalledTimes(0);
        await clock.asyncTick(25);
        expect(then).toHaveBeenCalledTimes(0);
        await clock.asyncTick(25);
        await expect(then).toHaveBeenCalledTimes(1);
        await expect(result).resolves.toBe(24);
    });
    it('cancels', async () => {
        const result = delay(24, 50);
        result.cancel();
        await expect(result).rejects.toThrow();
    });
    it('cancels with a custom error', async () => {
        const result = delay(24, 50);
        result.cancel(new Error('testing cancel'));
        await clock.asyncTick(50);
        await expect(result).rejects.toThrow('testing cancel');
    });
    it('cancels twice with an error', async () => {
        const result = delay(24, 50);
        result.cancel();
        await clock.asyncTick(50);
        expect(() => {
            result.cancel();
        }).toThrow();
        await expect(result).rejects.toThrow();
    });
    it('calls after the delay', async () => {
        const executor = jest.fn(() => 'delayed');
        const result = delay(executor, 50);
        await clock.asyncTick();
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.asyncTick(50);
        expect(executor).toHaveBeenCalledTimes(1);
        await expect(result).resolves.toBe('delayed');
    });
    it('cancels the executor function', async () => {
        const executor = jest.fn(() => 'test');
        const result = delay(executor, 50);
        result.cancel();
        clock.tick(50);
        expect(executor).toHaveBeenCalledTimes(0);
        await expect(result).rejects.toThrow();
    });
});
