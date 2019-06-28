import callReduce from './callReduce';

/**
 * @callback argumentsReducer
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
 * @property {function} cancel Call to cancel pending calls.
 */

/**
 * @function
 * Ensure multiple calls to a function will only execute it once no more calls have happend for `delay` milliseconds.
 * The result of the call will be returned as a promise to the caller.
 * @param {function} fn The function to debounce
 * @param {number} delay The number of milliseconds on inactivity before the function will be called.
 * @param {?argumentsReducer} argumentsReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the debounced function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param {number} maxDelay The maximum number of milliseconds before the function will be called.
 * If this is not 0 then the function will be called after the elapsed time.
 * @param {function} cancelFn If supplied this function will be called if the debounced function is cancelled.
 * @returns {debounced}
 */
export const debounce = (
    fn,
    delay = 50,
    argumentsReducer,
    maxDelay = 0,
    onCancel = null
) => {
    let lastRun = null;
    let timeout = null;
    const clear = () => {
        clearTimeout(timeout);
        timeout = null;
    };

    const postCall =
        maxDelay > 0
            ? () => {
                  if (lastRun === null) {
                      // this is the first ever call so initialize
                      lastRun = Date.now();
                  }
                  const elapsed = Date.now() - lastRun;
                  const wait =
                      elapsed > maxDelay
                          ? 0
                          : Math.min(maxDelay - elapsed, delay);
                  timeout = setTimeout(run, wait);
              }
            : () => {
                  timeout = setTimeout(run, delay);
              };

    const [call, invoke, reset] = callReduce(
        fn,
        argumentsReducer,
        () => {
            clear();
        },
        postCall
    );

    const run = () => {
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

export default debounce;
