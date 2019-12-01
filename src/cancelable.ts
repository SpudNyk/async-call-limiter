import pending from './pending';
import { CancelFunction, CancelablePromise } from './types';

/**
 * Wraps a promise that can be cancelled by calling it's cancel function
 * If the promise settles then call
 * Cancelling a promise causes it to reject with the given reason or Cancelled
 *
 * @param promise The promise to wrap.
 * @param canceller A function to call that will cause the wrapped promise to reject.
 * This can be used to abort transactions etc.
 *
 * @returns A cancellable promise.
 */
const cancelable = <T>(promise: Promise<T>, canceller?: CancelFunction) => {
    const result = pending<T>();
    let cancelReason: Error | false = false;
    let cancelled = false;
    let settled = false;
    const fireCancel = canceller
        ? canceller
        : (reason?: Error) => {
              cancelled = true;
              result.error(reason);
          };

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
    const resultPromise = result.promise as CancelablePromise<T>;
    resultPromise.cancel = (reason?) => {
        if (settled) {
            throw new Error('Already Settled');
        }
        if (cancelled) {
            throw new Error('Already Cancelled');
        }
        cancelReason = reason ? reason : new Error('Cancelled');
        fireCancel(cancelReason);
    };
    return resultPromise;
};

export default cancelable;
