/**
 * @internal
 */
import pending, { Pending } from './pending';
import {
    ReducerFunction,
    ReducerCallParameters,
    latestArguments
} from './callReducers';

/**
 * @internal
 */
export type CallFunction<F extends (...args: any[]) => any, Args extends any[]> = (
    ...args: Args
) => Promise<ReturnType<F>>;

/**
 * @internal
 */
const wrap = <F extends (...args: any[]) => any>(
    fn: F,
    before?: (...args: any[]) => any,
    after?: (...args: any[]) => any
): F => {
    let wrapped: (...args: any[]) => any = fn;
    if (before && after) {
        wrapped = (...args) => {
            before();
            const result = fn(...args);
            after();
            return result;
        };
    } else if (before) {
        wrapped = (...args) => {
            before();
            const result = fn(...args);
            return result;
        };
    } else if (after) {
        wrapped = (...args) => {
            const result = fn(...args);
            after();
            return result;
        };
    }
    return wrapped as F;
};

/**
 * @internal
 */
const getRunner = (
    fn: (...args: any[]) => any,
    args: any[],
    result: Pending<any>
) => () => {
    try {
        result.complete(fn(...args));
    } catch (e) {
        result.error(e);
    }
};

/**
 * @internal
 */
const empty = () => {};

/**
 * @internal
 *
 * Utility function that wraps a function and will use a reducer to combine the arguments
 * of multiple calls to that function. As the function is not executed until it is invoked
 * a promise for the result is returned to the callers.
 *
 * @param fn The function to wrap.
 * @param {?argumentsReducer} callReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the wrapped function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param onBeforeReduce If supplied this function will be called before the reducer is called.
 * @param onAfterReduce If supplied this function will be called if the wrapped function is cancelled.
 * @returns
 */
const callReduce = <
    Invoke extends (...args: any[]) => any,
    Reducer extends ReducerFunction<Invoke, any> = ReducerFunction<Invoke>
>(
    fn: Invoke,
    callReducer?: Reducer,
    onBeforeReduce?: (...args: any[]) => any,
    onAfterReduce?: (...args: any[]) => any
): [
    /**
     * This is the main wrapped function
     */
    CallFunction<
        Invoke,
        ReducerCallParameters<typeof reducer, Parameters<Invoke>>
    >,
    /**
     * Call this to prepare to invoke.
     * It returns a function that invokes the main function and
     * resolves it's result to any waiting callers.
     * This resets the current call state.
     */
    () => () => void,
    /**
     * Resets the current pending calls.
     *
     * This will cause all waiting callers to get either the passed in error or a reset.
     */
    (error?: Error) => void
] => {
    const reducer: Reducer =
        typeof callReducer === 'function'
            ? callReducer
            : (latestArguments as Reducer);
    let result: Pending<ReturnType<Invoke>> | null = null;
    let args: Parameters<Invoke> | any[] = [];

    const reject = (reason?: Error) => {
        if (result !== null) {
            result.error(reason ? reason : new Error('reset'));
            result = null;
            args = [];
        }
    };

    // capture the invocation state
    const prepare = () => {
        if (result === null) {
            // sanity check no result pending
            return empty;
        }
        const run = getRunner(fn, args, result);
        result = null;
        args = [];
        return run;
    };

    const call = wrap(
        (...callArgs: ReducerCallParameters<Reducer, Parameters<Invoke>>) => {
            args = reducer(args as Parameters<Invoke>, callArgs);
            if (result === null) {
                result = pending<ReturnType<Invoke>>();
            }
            return result.promise;
        },
        onBeforeReduce,
        onAfterReduce
    );

    return [call, prepare, reject];
};

export default callReduce;
