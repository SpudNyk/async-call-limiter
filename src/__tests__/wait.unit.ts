import ft from '@sinonjs/fake-timers';
import wait from '../wait';

describe('wait', () => {
    let clock;
    beforeAll(() => {
        clock = ft.install({ now: Date.now() });
    });
    afterAll(() => {
        clock.uninstall();
    });
    it('resolves after the delay', async () => {
        const then = jest.fn(v => v);
        const result = wait(50, 24);
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
        const result = wait(50, 24);
        const done = expect(result).rejects.toThrow();
        result.cancel();
        await done;
    });
    it('cancels with a custom error', async () => {
        const result = wait(50, 24);
        const done = expect(result).rejects.toThrow('testing cancel');
        result.cancel(new Error('testing cancel'));
        await clock.tickAsync(50);
        await done;
    });
    it('cancels twice with an error', async () => {
        const result = wait(50, 24);
        const done = expect(result).rejects.toThrow();
        result.cancel();
        await clock.tickAsync(50);
        expect(() => {
            result.cancel();
        }).toThrow();
        await done;
    });
    it('cancels the executor function', async () => {
        const executor = jest.fn(() => 'test');
        const result = wait(50, executor);
        const done = expect(result).rejects.toThrow();
        result.cancel();
        await clock.tickAsync(50);
        expect(executor).toHaveBeenCalledTimes(0);
        await done;
    });
    it('calls the executor function after the delay', async () => {
        const executor = jest.fn(() => 'delayed');
        const result = wait(50, executor);
        const done = expect(result).resolves.toBe('delayed');
        await clock.tickAsync(0);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(0);
        await clock.tickAsync(25);
        expect(executor).toHaveBeenCalledTimes(1);
        await done;
    });
    it('can use a promise', async () => {
        const result = wait(50, Promise.resolve('delayed with promise'));
        const done = expect(result).resolves.toBe('delayed with promise');
        await clock.tickAsync(50);
        await done;
    });
    it('stop resolves before delay', async () => {
        let settled = false;
        const waiting = wait(50);
        waiting.then(() => {
            settled = true;
        });
        const done = expect(waiting).resolves.toBeUndefined();
        await clock.tickAsync(25);
        expect(settled).toBe(false);
        waiting.stop();
        expect(settled).toBe(false);
        await clock.tickAsync(0);
        expect(settled).toBe(true);
        await done;
    });
    it('stop resolves value', async () => {
        let settled = false;
        const waiting = wait(50, 'testing');
        waiting.then(() => {
            settled = true;
        });
        const done = expect(waiting).resolves.toBe('testing');
        await clock.tickAsync(25);
        expect(settled).toBe(false);
        waiting.stop();
        expect(settled).toBe(false);
        await clock.tickAsync(0);
        expect(settled).toBe(true);
        await done;
    });
    it('stopping after resolved has no effect', async () => {
        let settled = false;
        const waiting = wait(50);
        waiting.then(() => {
            settled = true;
        });
        const done = expect(waiting).resolves.toBeUndefined();
        await clock.tickAsync(50);
        expect(settled).toBe(true); // resolved
        waiting.stop();
        await done;
    });
    it('stopping twice has no effect', async () => {
        let settled = false;
        const waiting = wait(50);
        waiting.then(() => {
            settled = true;
        });
        const done = expect(waiting).resolves.toBeUndefined();
        await clock.tickAsync(25);
        expect(settled).toBe(false);
        waiting.stop();
        await clock.tickAsync(0);
        expect(settled).toBe(true);
        waiting.stop();
        await clock.tickAsync(50);
        await done;
    });
});
