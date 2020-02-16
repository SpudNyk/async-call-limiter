import callReduce, { InvokeFunction, CallFunction } from './callReduce';
import deferred, { Deferred } from './deferred';
import { ReducerCallParameters, ReducerFunction } from './callReducers';

export interface Throttled<
    F extends InvokeFunction,
    R extends ReducerFunction<F, any>
> extends CallFunction<F, ReducerCallParameters<R>> {
    /**
     * Cancels pending execution. 
     * Pending results will be rejected.
     * @param reason Optional reason to reject results with.
     */
    cancel(reason?: Error): void;
};

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
 * @param argumentsReducer Used to create the arguments to `func` when it is
 * executed. It is run for every call of the throttled function. The default
 * implementation to execute `func` with the latest arguments.
 * @param onCancel If supplied this function will be called if the throttled function is cancelled.
 * @return The throttled function
 * 
 * @category Wrapper
 */
const throttle = <
    Invoke extends InvokeFunction,
    Reducer extends ReducerFunction<Invoke, any> = ReducerFunction<Invoke>
>(
    func: Invoke,
    delay: number = 50,
    argumentsReducer?: Reducer,
    onCancel?: () => any
): Throttled<Invoke, Reducer> => {
    const [call, invoke, reset] = callReduce(
        func,
        argumentsReducer,
        undefined,
        () => {
            // nothing pending so go
            if (execute.delay < 0) {
                const elapsed =
                    execute.called > 0 ? Date.now() - execute.called : delay;
                // call right away or with how much time to go before next call
                execute.defer(elapsed >= delay ? 0 : delay - elapsed);
            }
        }
    );
    const execute = deferred(invoke);


    const cancel = (reason?: Error) => {
        execute.cancel();
        if (onCancel) {
            onCancel();
        }
        reset(reason ? reason : new Error('cancelled'));
    };

    const wrapped = (call as unknown) as Throttled<Invoke, Reducer>;
    wrapped.cancel = cancel;
    return wrapped;
};

export default throttle;
