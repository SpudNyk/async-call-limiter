import callReduce, { InvokeFunction, CallFunction } from './callReduce';
import { ReducerCallParameters, ReducerFunction } from './callReducers';
import { Cancelable } from './types';
import deferred, { Deferred } from './deferred';

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
 * Ensure multiple calls to a function will only execute it when it has been
 * inactive (no more calls) for a specified delay.
 *
 * Execution always happens asynchronously.
 *
 * If the delay is `0` execution will be scheduled to occur after the current
 * runtime event loop.
 *
 * The debounced function returns a promise that resolves to the return value
 * of `func`.
 *
 * By default the arguments to `func` are the latest arguments given to the
 * debounced function. For custom behaviour pass an `argumentsReducer`
 * function.
 *
 * @param fn The function to debounce
 * @param delay The number of milliseconds on inactivity before the function
 * will be executed.
 * @param argumentsReducer Used to create the arguments to `fn` when it is
 * executed. It is run for every call of the debounced function. The default
 * implementation is to execute `func` with the latest arguments.
 * @param maxDelay The maximum number of milliseconds before the function will
 * be executed. If execution has not happened as calls are still occuring then
 * this the maximum number of milliseconds allowed to pass before the function
 * will be executed.
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
    // Micro optimization if delay is zero defer will always force execution next tick so we can ignore maxDelay
    // as all calls this process tick will be handled next tick
    const afterReduce =
        delay > 0 && maxDelay > 0
            ? () => {
                  if (execute.delay < 0) {
                      // execute is fresh reset started
                      started = Date.now();
                      execute.defer(Math.min(delay, maxDelay));
                  } else {
                      const elapsed = Date.now() - started;
                      if (elapsed >= maxDelay) {
                          // it's been too long force execution next tick
                          execute.defer(0);
                      } else {
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
        afterReduce
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
