import pending from './pending';

const cancelable = (promise, canceller) => {
    const result = pending();
    let cancelReason = false;
    let cancelled = false;
    let settled = false;

    if (!canceller) {
        canceller = reason => {
            cancelled = true;
            result.error(reason);
        };
    }

    promise.then(
        value => {
            if (settled || cancelled) {
                return;
            }
            if (cancelReason) {
                cancelled = true;
                result.error(cancelReason);
                return;
            }
            result.complete(value);
            settled = true;
        },
        error => {
            if (settled || cancelled) {
                return;
            }
            if (cancelReason) {
                result.error(cancelReason);
                cancelled = true;
            } else {
                result.error(error);
                settled = true;
            }
        }
    );
    result.promise.cancel = reason => {
        if (settled) {
            throw new Error('Already Settled');
        }
        if (cancelled) {
            throw new Error('Already Cancelled');
        }
        cancelReason = reason ? reason : new Error('Cancelled');
        canceller(cancelReason);
    };
    return result.promise;
};

export default cancelable;
