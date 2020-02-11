import ft from '@sinonjs/fake-timers';
import delay from '../delay';

describe('delay', () => {
    let clock;
    beforeAll(() => {
        clock = ft.install({ now: Date.now() });
    });
    afterAll(() => {
        clock.uninstall();
    });
    it('resolves after the delay', async () => {
        const then = jest.fn(v => v);
        const result = delay(24, 50);
        result.then(then);
        await clock.tickAsync(1);
        expect(then).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        expect(then).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        await expect(then).toHaveBeenCalledTimes(1);
        await expect(result).resolves.toBe(24);
    });
    it('cancels', async () => {
        const result = delay(24, 50);
        const done = expect(result).rejects.toThrow();
        result.cancel();
        await done;
    });
    it('cancels with a custom error', async () => {
        const result = delay(24, 50);
        const done = expect(result).rejects.toThrow('testing cancel');
        result.cancel(new Error('testing cancel'));
        await clock.tickAsync(50);
        await done;
    });
    it('cancels twice with an error', async () => {
        const result = delay(24, 50);
        const done = expect(result).rejects.toThrow();
        result.cancel();
        await clock.tickAsync(50);
        expect(() => {
            result.cancel();
        }).toThrow();
        await done;
    });
    it('calls after the delay', async () => {
        const executor = jest.fn(() => 'delayed');
        const result = delay(executor, 50);
        const done = expect(result).resolves.toBe('delayed');
        await clock.tickAsync(0);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(50);
        await clock.tickAsync(10);
        await clock.tickAsync(11);
        expect(executor).toHaveBeenCalledTimes(1);
        await done;
    });
    it('cancels the executor function', async () => {
        const executor = jest.fn(() => 'test');
        const result = delay(executor, 50);
        const done = expect(result).rejects.toThrow();
        result.cancel();
        clock.tick(50);
        expect(executor).toHaveBeenCalledTimes(0);
        await done;
    });
});
