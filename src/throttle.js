import callReduce from './callReduce';

/**
 * A throttled function
 * @callback throttled
 * @param {...*} arguments The arguments to the function.
 * @returns {Promise} A promise that will resolve with the result of the function.
 * @property {function} cancel Call to cancel pending calls.
 */

/**
 * Ensure multiple calls to a function will only execute it at most once every `delay` milliseconds.
 * The result of the call will be returned as a promise to the caller.
 * @param {function} fn The function to throttle
 * @param {number} delay The number of milliseconds between functions.
 * @param {?argumentsReducer} argumentsReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the throttled function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param {function} onCancel If supplied this function will be called if the throttled function is cancelled.
 * @returns {throttled}
 */
const throttle = (fn, delay = 50, argumentsReducer, onCancel = null) => {
    let timeout = null;
    let lastRun = null;
    const clear = () => {
        clearTimeout(timeout);
        timeout = null;
    };

    const [call, invoke, reset] = callReduce(
        fn,
        argumentsReducer,
        undefined,
        () => {
            if (lastRun === null) {
                // first run schedule right away
                lastRun = Date.now();
                timeout = setTimeout(run, 0);
            }
            // no timer scheduled
            if (timeout === null) {
                const elapsed = Date.now() - lastRun;
                timeout = setTimeout(run, Math.max(delay - elapsed, 0));
            }
        }
    );

    const run = () => {
        clear();
        lastRun = Date.now();
        invoke();
    };

    const cancel = reason => {
        clear();
        if (onCancel) {
            onCancel();
        }
        reset(reason ? reason : new Error('cancelled'));
    };

    call.cancel = cancel;
    return call;
};

export default throttle;
