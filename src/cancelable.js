import pending from './pending';

const cancelable = (promise, canceller) => {
    const result = pending();
    let canceling = false;
    let cancelled = false;
    let complete = false;

    if (!canceller) {
        canceller = reason => {
            cancelled = true;
            result.error(reason);
        };
    }

    promise.then(
        value => {
            if (complete || canceling || cancelled) {
                return;
            }
            result.complete(value);
            complete = true;
        },
        error => {
            if (complete || cancelled) {
                return;
            }
            result.error(error);
            if (canceling) {
                cancelled = true;
            }
        }
    );
    result.promise.cancel = reason => {
        if (complete) {
            throw new Error('Already Completed');
        }
        if (cancelled) {
            throw new Error('Already Cancelled');
        }
        canceling = true;
        canceller(reason ? reason : new Error('Cancelled'));
    };
    return result.promise;
};

export default cancelable;
