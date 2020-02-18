import callReduce, { CallFunction } from './callReduce';
import deferred from './deferred';
import { ReducerCallParameters, ReducerFunction } from './callReducers';

/**
 * Options for [[throttle]]
 *
 * @typeparam Reducer an [[ArgumentsReducer]]
 *
 * @category Throttle
 */
export interface ThrottleOptions<Reducer> {
    /**
     * Used to create the arguments to `fn` when it is
     * executed. It is run for every call of the debounced function. The default
     * implementation is to execute `func` with the latest arguments.
     */
    reducer?: Reducer;
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
 * A throttled function
 *
 * @category Throttle
 */
export interface Throttled<
    F extends (...args: any[]) => any,
    R extends ReducerFunction<F, any>
> extends CallFunction<F, ReducerCallParameters<R>> {
    /**
     * Cancels pending execution.
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
 * Ensure multiple calls to a function will only execute at most once every
 * `delay` milliseconds.
 *
 * The execution will always happens asynchronously. If the delay is `0` then
 * execution will occur after the current runtime event loop.
 *
 * The throttled function returns a promise that resolves to the return value
 * of `func`.
 *
 * By default the arguments to `func` are the latest arguments given to the
 * throttled function. For custom behaviour pass an `argumentsReducer`
 * function.
 *
 * @param func The function to throttle
 * @param delay The number of milliseconds between executions.
 * @param options Debounce options
 * @return The throttled function
 *
 * @category Wrapper
 */
const throttle = <
    Invoke extends (...args: any[]) => any,
    Reducer extends ReducerFunction<Invoke, any> = ReducerFunction<Invoke>
>(
    func: Invoke,
    delay = 50,
    options: ThrottleOptions<Reducer> = {}
): Throttled<Invoke, Reducer> => {
    const { reducer, onCancel, maxCalls } = options;
    let calls = 0;
    const afterReduce = (): void => {
        if (maxCalls) {
            calls++;
            if (calls >= maxCalls) {
                flush();
                return;
            }
        }
        // nothing pending so go
        if (execute.delay < 0) {
            const elapsed =
                execute.called > 0 ? Date.now() - execute.called : delay;
            // call right away or with how much time to go before next call
            execute.defer(elapsed >= delay ? 0 : delay - elapsed);
        }
    };
    const [call, runner, reject] = callReduce(
        func,
        reducer,
        undefined,
        afterReduce
    );
    const execute = deferred(() => {
        calls = 0;
        runner()();
    });
    const flush = (): void => {
        calls = 0;
        execute.cancel();
        deferred(runner()).defer(0);
    };

    const cancel = (reason?: Error): void => {
        execute.cancel();
        if (onCancel) {
            onCancel();
        }
        reject(reason ? reason : new Error('cancelled'));
    };

    const wrapped = (call as unknown) as Throttled<Invoke, Reducer>;
    wrapped.cancel = cancel;
    wrapped.flush = flush;
    return wrapped;
};

export default throttle;
