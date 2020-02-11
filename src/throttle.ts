import callReduce, { InvokeFunction, CallFunction } from './callReduce';
import deferred, { Deferred } from './deferred';
import { ReducerCallParameters, ReducerFunction } from './callReducers';
import { Cancelable } from './types';

type Throttled<
    F extends InvokeFunction,
    R extends ReducerFunction<F, any>
> = CallFunction<F, ReducerCallParameters<R>> & Cancelable;

/**
 * Ensure multiple calls to a function will only execute it at most once every `delay` milliseconds.
 * The result of the call will be returned as a promise to the caller.
 * @param fn The function to throttle
 * @param delay The number of milliseconds between functions.
 * @param argumentsReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the throttled function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param onCancel If supplied this function will be called if the throttled function is cancelled.
 */
const throttle = <
    Invoke extends InvokeFunction,
    Reducer extends ReducerFunction<Invoke, any> = ReducerFunction<Invoke>
>(
    fn: Invoke,
    delay: number = 50,
    argumentsReducer?: Reducer,
    onCancel?: () => any
): Throttled<Invoke, Reducer> => {
    const [call, invoke, reset] = callReduce(
        fn,
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
