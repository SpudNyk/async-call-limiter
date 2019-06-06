const pending = () => {
    const value = {};
    value.promise = new Promise((resolve, reject) => {
        value.complete = resolve;
        value.error = reject;
    });
    return value;
};

/**
 * A debounce arguments reducer that always uses the latest given arguments
 * @param {*[]} current The current arguments
 * @param {*[]} next The next arguments
 * @returns {*[]} The new arguments
 */
export const latestArgumentsReducer = (current, next) => next;

/**
 * @callback debounceArgumentsReducer
 * Combines multiple debounced function call arguments into a single list for the actual
 * execution of the function.
 * @param {*[]} current The current reduced arguments (empty for the initial call).
 * @param {*[]} next The next arguments.
 * @returns {*[]} The new reduced arguments.
 */

/**
 * A debounced function
 * @callback debounced
 * @param {...*} arguments The arguments to the function.
 * @returns {Promise} A promise that will resolve with the result of the function.
 * @property {function} cancel Call to cancel and pending calls.
 */

/**
 * @function
 * Ensure multiple calls to a function will only execute it once no more calls have happend for `delay` milliseconds.
 * The result of the call will be returned as a promise to the caller.
 * @param {function} fn The function to debounce
 * @param {number} delay The number of milliseconds before the function will be called.
 * @param {?debounceArgumentsReducer} argumentsReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the debounced function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param {function} cancelFn If supplied this function will be called if the debounced function is cancelled.
 * @returns {debounced}
 */
const debounce = (fn, delay = 50, argumentsReducer, cancelFn = null) => {
    const reducer =
        typeof argumentsReducer === 'function'
            ? argumentsReducer
            : latestArgumentsReducer;
    let result = null;
    let timeout = null;
    let args = [];

    const clear = () => {
        clearTimeout(timeout);
        timeout = null;
    };

    const cancel = () => {
        clear();
        if (cancelFn) {
            cancelFn();
        }
        if (result !== null) {
            result.error(new Error('cancelled'));
            result = null;
            args = [];
        }
    };

    const invoke = () => {
        if (result === null) {
            // sanity check no result pending
            return;
        }
        const final = result;
        const callArgs = args;
        // reset for subsequent calls;
        result = null;
        args = [];

        try {
            final.complete(fn(...callArgs));
        } catch (e) {
            final.error(e);
        }
    };

    const debounced = (...callArgs) => {
        clear();
        args = reducer(args, callArgs);

        if (result === null) {
            result = pending();
        }
        timeout = setTimeout(invoke, delay);
        return result.promise;
    };
    debounced.cancel = cancel;
    return debounced;
};

export default debounce;
