import pending from './pending';
import latestArgumentsReducer from './latestArgumentsReducer';

/**
 * @callback callReducer
 * Combines multiple debounced function call arguments into a single list for the actual
 * execution of the function.
 * @param {*[]} current The current reduced arguments (empty for the initial call).
 * @param {*[]} next The next arguments.
 * @returns {*[]} The new reduced arguments.
 */

/**
 * @function
 * Ensure multiple calls to a function will only execute it once no more calls have happend for `delay` milliseconds.
 * The result of the call will be returned as a promise to the caller.
 * @param {function} fn The function to debounce
 * @param {number} delay The number of milliseconds before the function will be called.
 * @param {?callReducer} callReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the debounced function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param {function} cancelFn If supplied this function will be called if the debounced function is cancelled.
 * @returns {debounced}
 */
const onCallDefault = () => {};
const callReduce = (fn, callReducer, onStartCall = onCallDefault, onEndCall = onCallDefault) => {
    const reducer =
        typeof callReducer === 'function'
            ? callReducer
            : latestArgumentsReducer;
    let result = null;
    let args = [];

    const reset = reason => {
        if (result !== null) {
            result.error(reason ? reason : new Error('reset'));
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

    const call = (...callArgs) => {
        onStartCall()
        args = reducer(args, callArgs);
        if (result === null) {
            result = pending();
        }
        onEndCall();
        return result.promise;
    };

    return [call, invoke, reset];
};

export default callReduce;
