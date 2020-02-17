import callReduce, { CallFunction } from './callReduce';
import { ReducerCallParameters, ReducerFunction } from './callReducers';
import deferred from './deferred';

/**
 * Options for [[debounce]]
 * 
 * @typeparam Reducer an [[ArgumentsReducer]]
 * 
 * @category Debounce
 */
export interface DebounceOptions<Reducer> {
    /**
     * Used to create the arguments to `fn` when it is
     * executed. It is run for every call of the debounced function. The default
     * implementation is to execute `func` with the latest arguments.
     */
    reducer?: Reducer;
    /**
     * The maximum number of milliseconds before the function will
     * be executed. If execution has not happened as calls are still occuring then
     * this the maximum number of milliseconds allowed to pass before the function
     * will be executed.
     */
    maxDelay?: number;
    /**
     * The maximum number of calls before the function will
     * be executed
     */
    maxCalls?: number;
    /**
     * If supplied this function will be called if the debounced function is cancelled
     * defaults
     */
    onCancel?: () => any;
}

/**
 * A debounced function
 * 
 * @category Debounce
 */
export interface Debounced<
    F extends (...args: any[]) => any,
    R extends ReducerFunction<F, any>
> extends CallFunction<F, ReducerCallParameters<R>> {
    /**
     * Cancels pending function execution.
     * Pending results will be rejected.
     * @param reason Optional reason to reject results with.
     */
    cancel(reason?: Error): void;
    /**
     * Causes any pending execution to fire on next runtime loop
     * Subsequent calls will not defer this execution
     */
    flush(): void;
}



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
.
 * @return the debounced function
 *
 * @category Wrapper
 */
const debounce = <
    Invoke extends (...args: any[]) => any,
    Reducer extends ReducerFunction<Invoke, any> = ReducerFunction<Invoke>
>(
    fn: Invoke,
    delay = 50,
    options: DebounceOptions<Reducer> = {}
): Debounced<Invoke, Reducer> => {
    const { reducer, maxDelay = 0, maxCalls, onCancel } = options;
    let started = 0;
    let calls = 0;
    // Micro optimization if delay is zero defer will always force execution next tick so we can ignore maxDelay
    // as all calls this process tick will be handled next tick
    const afterReduce =
        delay > 0 && maxDelay > 0
            ? () => {
                  if (maxCalls) {
                      calls++;
                      if (calls >= maxCalls) {
                          flush();
                          return;
                      }
                  }
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
                  if (maxCalls) {
                      calls++;
                      if (calls >= maxCalls) {
                          flush();
                          return;
                      }
                  }
                  execute.defer(delay);
              };

    const [call, runner, reject] = callReduce(
        fn,
        reducer,
        undefined,
        afterReduce
    );

    const execute = deferred(() => {
        calls = 0;
        runner()();
    });

    const flush = () => {
        calls = 0;
        execute.cancel();
        deferred(runner()).defer(0);
    };
    const cancel = (reason?: Error) => {
        calls = 0;
        execute.cancel();
        if (onCancel) {
            onCancel();
        }
        reject(reason ? reason : new Error('cancelled'));
    };

    const debounced = (call as unknown) as Debounced<Invoke, Reducer>;
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
};

export default debounce;
