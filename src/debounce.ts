import callReduce, { InvokeFunction, CallFunction } from './callReduce';
import { ReducerCallParameters, ReducerFunction } from './callReducers';
import { Cancelable } from './types';
import deferred from './deferred';

/**
 * The debounced function
 */
type Debounced<
    F extends InvokeFunction,
    R extends ReducerFunction<F, any>
> = CallFunction<F, ReducerCallParameters<R>> & Cancelable;

/**
 * A debounced function
 * @callback debounced
 * @param {...*} arguments The arguments to the function.
 * @returns {Promise} A promise that will resolve with the result of the function.
 * @property {function} cancel Call to cancel pending calls.
 */

/**
 * Ensure multiple calls to a function will only execute it once no more calls have happend for `delay` milliseconds.
 * The result of the call will be returned as a promise to the caller.
 * @param fn The function to debounce
 * @param delay The number of milliseconds on inactivity before the function will be called.
 * @param argumentsReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the debounced function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param maxDelay The maximum number of milliseconds before the function will be called.
 * If this is not 0 then the function will be called after the elapsed time.
 * @param cancelFn If supplied this function will be called if the debounced function is cancelled.
 * @return the debounced function
 */

const debounce = <
    Invoke extends InvokeFunction,
    Reducer extends ReducerFunction<Invoke, any> = ReducerFunction<Invoke>
>(
    fn: Invoke,
    delay = 50,
    argumentsReducer?: Reducer,
    maxDelay = 0,
    onCancel?: () => any
): Debounced<Invoke, Reducer> => {
    let started = 0;
    const postCall =
        maxDelay > 0
            ? () => {
                  if (execute.delay < 0) {
                      // execute is fresh reset started
                      started = Date.now();
                      execute.defer(Math.min(delay, maxDelay));
                  } else {
                      const elapsed = Date.now() - started;
                      if (elapsed >= maxDelay) {
                          // defer is protected for 0;
                          execute.defer(0);
                      } else {
                          // wait the minimum amount;
                          const wait = Math.min(delay, maxDelay - elapsed);
                          execute.defer(wait);
                      }
                  }
              }
            : () => {
                  execute.defer(delay);
              };

    const [call, invoke, reset] = callReduce(
        fn,
        argumentsReducer,
        undefined,
        postCall
    );
    const execute = deferred(invoke);

    const cancel = (reason?: Error) => {
        execute.cancel();
        if (onCancel) {
            onCancel();
        }
        reset(reason ? reason : new Error('cancelled'));
    };

    const debounced = (call as unknown) as Debounced<Invoke, Reducer>;
    debounced.cancel = cancel;
    return debounced;
};

export default debounce;
