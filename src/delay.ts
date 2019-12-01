import pending, { Pending } from './pending';
import { CancelablePromise } from './types';

/**
 * Promises a given value/or function call result after a given wait
 * @param {*|function} value The value or function to return after the delay.
 * If a function is supplied it is executed after the wait and it's result
 * is returned.
 * @param wait The wait time in milliseconds before the value is returned.
 * @returns A cancelable promise that resolves with the value/function result.
 * The promise also has a `cancel` function to allow canceling the result.
 * This can be called before the wait is over to reject the promise and not
 * execute any pending functions.
 */
const delay = <T extends any>(value: T, wait: number): CancelablePromise<T> => {
    const result = pending<T>();
    const timeout = setTimeout(() => {
        result.complete(typeof value === 'function' ? value() : value);
    }, wait);
    const promise = result.promise as CancelablePromise<T>;
    promise.cancel = (error?: Error) => {
        clearTimeout(timeout);
        result.error(error ? error : new Error('Cancelled'));
    };
    return promise;
};

export default delay;
