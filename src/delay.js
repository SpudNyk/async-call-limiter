import pending from './pending';

/**
 * Promises a given value/or function call result after a given wait
 * @param {*|function} value The value or function to return after the delay.
 * If a function is supplied it is executed after the wait and it's result
 * is returned.
 * @param {number} wait The wait time before the value is returned.
 * @returns {Promise} A promise that resolves with the value/function result.
 * The promise also has a `cancel` function to allow canceling the result.
 * This can be called before the wait is over to reject the promise and not
 * execute any pending functions.
 */
const delay = (value, wait) => {
    const result = pending();
    const timeout = setTimeout(() => {
        result.complete(typeof value === 'function' ? value() : value);
    }, wait);
    result.promise.cancel = error => {
        clearTimeout(timeout);
        result.error(error ? error : new Error('Cancelled'));
    };
    return result.promise;
};

export default delay;
