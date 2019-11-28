import pending from './pending';
import latestArgumentsReducer from './latestArgumentsReducer';

const onCallDefault = () => {};
/**
 * Utility function that wraps a function and will use a reducer to combine the arguments
 * of multiple calls to that function. As the function is not executed until it is invoked
 * a promise for the result is returned to the callers.
 * @param {function} fn The function to wrap.
 * @param {?argumentsReducer} callReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the wrapped function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param {function} onBeforeReduce If supplied this function will be called before the reducer is called.
 * @param {function} onAfterReduce If supplied this function will be called if the wrapped function is cancelled.
 * @returns {debounced}
 */
const callReduce = (
    fn,
    callReducer,
    onBeforeReduce = onCallDefault,
    onAfterReduce = onCallDefault
) => {
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
        onBeforeReduce();
        args = reducer(args, callArgs);
        if (result === null) {
            result = pending();
        }
        onAfterReduce();
        return result.promise;
    };

    return [call, invoke, reset];
};

export default callReduce;
