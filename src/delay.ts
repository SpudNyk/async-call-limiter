import pending from './pending';
import { CancelablePromise } from './types';
import deferred from './deferred';

type CallReturns<T extends any> = () => T;
type Resolver<T extends any> = T | CallReturns<T>;

/**
 * Promises a given value/or function call result after a given wait
 * @param value The value or function to return after the delay.
 * If a function is supplied it is executed after the wait and it's result
 * is returned.
 * @param wait The wait time in milliseconds before the value is returned.
 * @returns A cancelable promise that resolves with the value/function result.
 * The promise also has a `cancel` function to allow canceling the result.
 * This can be called before the wait is over to reject the promise and not
 * execute any pending functions.
 */
const later = <T extends any>(
    value: Resolver<T>,
    wait: number
): CancelablePromise<T> => {
    const result = pending<T>();
    const execute = deferred(() => {
        // @ts-ignore
        result.complete(typeof value === 'function' ? value() : value);
    });
    execute.defer(wait);
    const promise = result.promise as CancelablePromise<T>;
    promise.cancel = (error?: Error) => {
        execute.cancel();
        result.error(error ? error : new Error('Cancelled'));
    };
    return promise;
};

export default later;
