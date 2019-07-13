import cancelable from '../cancelable';
import pending from '../pending';

describe('cancelable', () => {
    it('settles if not cancelled', async () => {
        const resolved = cancelable(Promise.resolve(42));
        await expect(resolved).resolves.toBe(42);
        const rejected = cancelable(Promise.reject(new Error('rejected')));
        await expect(rejected).rejects.toThrow('rejected');
    });
    it('cancels', async () => {
        const resolved = cancelable(Promise.resolve());
        resolved.cancel();
        await expect(resolved).rejects.toThrow('Cancelled');
        const rejected = cancelable(Promise.reject(new Error('rejected')));
        rejected.cancel();
        await expect(rejected).rejects.toThrow('Cancelled');
    });
    it('cancels with reason', async () => {
        const resolved = cancelable(Promise.resolve());
        resolved.cancel(new Error('Cancel Reason'));
        await expect(resolved).rejects.toThrow('Cancel Reason');
    });
    it('cannot cancel twice', async () => {
        const promise = cancelable(Promise.resolve());
        promise.cancel();
        await expect(promise).rejects.toThrow();
        expect(() => {
            promise.cancel();
        }).toThrow('Already Cancelled');
    });
    it('cannot cancel settled', async () => {
        const promise = cancelable(Promise.resolve(40));
        await expect(promise).resolves.toBe(40);
        expect(() => {
            promise.cancel();
        }).toThrow('Already Settled');
        const rejected = cancelable(Promise.reject(new Error('rejected')));
        await expect(rejected).rejects.toThrow('rejected');
        expect(() => {
            rejected.cancel();
        }).toThrow('Already Settled');
    });
    it('calls canceler', async () => {
        const canceller = jest.fn(() => {});
        const resolved = cancelable(Promise.resolve(), canceller);
        const reason = new Error('Cancel Reason');
        resolved.cancel(reason);
        expect(canceller).toBeCalledWith(reason);
        await expect(resolved).rejects.toThrow('Cancel Reason');
        const canceller2 = jest.fn(() => {});
        const rejected = cancelable(
            Promise.reject(new Error('rejected')),
            canceller2
        );
        rejected.cancel(reason);
        expect(canceller2).toBeCalledWith(reason);
        await expect(rejected).rejects.toThrow('Cancel Reason');
    });
    it('returns correct error on canceled', async () => {
        const value = pending();
        const canceller = jest.fn(() => {
            value.error(new Error('Oops'));
        });
        const resolved = cancelable(value.promise, canceller);
        const reason = new Error('Cancel Reason');
        resolved.cancel(reason);
        expect(canceller).toBeCalledWith(reason);
        await expect(resolved).rejects.toThrow('Cancel Reason');
        await expect(value.promise).rejects.toThrow('Oops');
    });
});
