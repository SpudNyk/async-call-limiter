import callReduce, {
    InvokeFunction,
    ArgumentsReducer,
    CallFunction
} from './callReduce';
import { Cancelable } from './types';

type Throttled<F extends InvokeFunction, CallArgs extends any[]> = CallFunction<
    F,
    CallArgs
> &
    Cancelable;

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
    CallArgs extends any[] = Parameters<Invoke>
>(
    fn: Invoke,
    delay: number = 50,
    argumentsReducer?: ArgumentsReducer<Parameters<Invoke>, CallArgs>,
    onCancel?: () => any
): Throttled<Invoke, CallArgs> => {
    let timeout: number | undefined;
    let lastRun: number | null = null;
    const clear = () => {
        clearTimeout(timeout);
        timeout = undefined;
    };

    const [call, invoke, reset] = callReduce<Invoke, CallArgs>(
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
            if (timeout === undefined) {
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

    const cancel = (reason?: Error) => {
        clear();
        if (onCancel) {
            onCancel();
        }
        reset(reason ? reason : new Error('cancelled'));
    };

    const wrapped = call as Throttled<Invoke, CallArgs>;
    wrapped.cancel = cancel;
    return wrapped;
};

export default throttle;
