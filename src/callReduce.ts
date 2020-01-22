import pending, { Pending } from './pending';
import { BaseFunction } from './types';

export interface InvokeFunction extends BaseFunction {}

export type CallFunction<F extends InvokeFunction, Args extends any[]> = (
    ...args: Args
) => Promise<ReturnType<F>>;

/**
 * reducer used to create the invocation arguments for a function call.
 */
export interface ArgumentsReducer<
    InvokeArgs extends any[] = any[],
    CallArgs extends any[] = any[]
> {
    /**
     * @param invokeArgs The current invocation arguments for the main function.
     * @param callArgs The arguments given to the latest call.
     * @returns The new invocation arguments.
     */
    (invokeArgs: InvokeArgs, callArgs: CallArgs): InvokeArgs;
}

export type ReducerFunction<
    F extends InvokeFunction,
    CallArgs extends any[] = Parameters<F>
> = ArgumentsReducer<Parameters<F>, CallArgs>;

export type ReducerCallParameters<
    Reducer extends ArgumentsReducer<any, any> | undefined,
    D = never
> = Reducer extends (i: any, call: infer Args) => any ? Args : D;

export const latestArgumentsReducer = <T extends any[]>(
    invokeArgs: T,
    callArgs: T
): T => callArgs;

const noop = () => {};
const wrap = <F extends BaseFunction>(
    fn: F,
    before?: BaseFunction,
    after?: BaseFunction
): F => {
    let wrapped: BaseFunction = fn;
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
 * Utility function that wraps a function and will use a reducer to combine the arguments
 * of multiple calls to that function. As the function is not executed until it is invoked
 * a promise for the result is returned to the callers.
 * @param fn The function to wrap.
 * @param {?argumentsReducer} callReducer Used to determine the arguments when `fn` is invoked.
 * This will be called every time the wrapped function is called.
 * If not supplied the default implementation of only using the latest arguments will be used.
 * @param onBeforeReduce If supplied this function will be called before the reducer is called.
 * @param onAfterReduce If supplied this function will be called if the wrapped function is cancelled.
 * @returns
 */
const callReduce = <
    Invoke extends InvokeFunction,
    Reducer extends ReducerFunction<Invoke, any> = ReducerFunction<Invoke>
>(
    fn: Invoke,
    callReducer?: Reducer,
    onBeforeReduce?: BaseFunction,
    onAfterReduce?: BaseFunction
): [
    /**
     * This is the main wrapped function
     */
    CallFunction<
        Invoke,
        ReducerCallParameters<typeof reducer, Parameters<Invoke>>
    >,
    /**
     * Call this to invoke the main function and return it's result to any waiting callers
     */
    () => void,
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
            : (latestArgumentsReducer as Reducer);
    let result: Pending<ReturnType<Invoke>> | null = null;
    let args: Parameters<Invoke> | any[] = [];

    const reset = (reason?: Error) => {
        if (result !== null) {
            result.error(reason ? reason : new Error('reset'));
            result = null;
            args = [];
        }
    };

    const invoke = () => {
        if (result === null) {
            // sanity check no result pending
            return;
        }
        const final = result;
        const invokeArgs = args;
        // reset for subsequent calls;
        result = null;
        args = [];
        try {
            final.complete(fn(...invokeArgs));
        } catch (e) {
            final.error(e);
        }
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

    return [call, invoke, reset];
};

export default callReduce;
