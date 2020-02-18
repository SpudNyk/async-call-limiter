/**
 * A reducer used to create the invocation arguments for a function over
 * multiple calls.
 *
 * It receives the current invocation arguments and the call arguments and
 * returns the new invocation arguments.
 *
 * @category Argument Reducer
 */
export type ArgumentsReducer<
    InvokeArgs extends any[] = any[],
    CallArgs extends any[] = any[]
> =
    /**
     * @param invokeArgs The current invocation arguments for the main function.
     * The first call will be an empty array.
     * @param callArgs The arguments given to the latest call.
     * @returns The new invocation arguments.
     */
    (invokeArgs: InvokeArgs, callArgs: CallArgs) => InvokeArgs;

/**
 * @internal
 * extracts arguments from function or uses a supplied tuple
 */
export type ParametersOrArray<
    T extends (...args: any[]) => any | any[]
> = T extends (...args: any[]) => any ? Parameters<T> : T;

/**
 * An implementation [[ArgumentsReducer]] for a particular invocation
 * function.
 *
 * @typeparam InvokeFunc the type of the invocation function.
 * @typeparam CallFuncOrArgs the arguments or type of the call function.
 *
 * @category Argument Reducer
 */
export type ReducerFunction<
    InvokeFunc extends (...args: any[]) => any,
    CallFuncOrArgs extends (...args: any[]) => any | any[] = InvokeFunc
> = ArgumentsReducer<Parameters<InvokeFunc>, ParametersOrArray<CallFuncOrArgs>>;

/**
 * @internal
 */
export type ReducerCallParameters<
    Reducer extends ArgumentsReducer<any, any> | undefined,
    D = never
> = Reducer extends (i: any, call: infer Args) => any ? Args : D;

/**
 * An arguments reducer that will use the latest call arguments as
 * the invocation arguments.
 *
 * Example:
 * ```
 * // the sequence of calls below to a call function
 * call(1);
 * call(1,2,3);
 * call(4,5);
 * call([1]);
 * call('last');
 * // would be the equivalent to the invoke call below.
 * invoke('last');
 * ```
 *
 * @category Argument Reducer
 */
export const latestArguments = <T extends any[]>(
    invokeArgs: T,
    callArgs: T
): T => callArgs;

/**
 * An arguments reducer that takes combines all arguments from every call
 * function into an array that is used as the first argument to the invoke
 * function.
 *
 * Example:
 * ```
 * // the sequence of calls below to a call function
 * call(1);
 * call(1,2,3);
 * call(4,5);
 * call([1]);
 * call('last');
 * // would be the equivalent to the invoke call below.
 * invoke([1, 1, 2, 3, 4, 5, [1], 'last']);
 * ```
 *
 * @category Argument Reducer
 */
export const combineArguments = <T extends any>(
    invokeArgs: [T[]],
    callArgs: T[]
): [T[]] => {
    let [combined] = invokeArgs;
    if (combined === undefined) {
        invokeArgs[0] = combined = [];
    }
    combined.push(...callArgs);
    return invokeArgs;
};

/**
 * Reducer that extends the invocation arguments array with all arguments
 * given to it.
 *
 * Example:
 * ```
 * // the sequence of calls below to a call function
 * call(1);
 * call(1,2,3);
 * call(4,5);
 * call([1]);
 * call('last');
 * // would be the equivalent to the invoke call below.
 * invoke(1, 1, 2, 3, 4, 5, [1], 'last');
 * ```
 *
 * @category Argument Reducer
 */
export const extendArguments = <T extends any>(
    invokeArgs: T[],
    callArgs: T[]
): T[] => {
    invokeArgs.push(...callArgs);
    return invokeArgs;
};

/**
 * Reducer that provices the invocation function with a single array of
 * arrays of all calls.
 *
 * ```
 * // the sequence of calls below to a call function
 * call(1);
 * call(1,2,3);
 * call(4,5);
 * call([1]);
 * call('last');
 * // would be the equivalent to the invoke call below.
 * invoke([[1], [1, 2, 3], [4, 5], [[1]], ['last']]);
 * ```
 *
 * @category Argument Reducer
 */
export const callArguments = <T extends any>(
    invokeArgs: [T[]],
    callArgs: T
): [T[]] => {
    let [calls] = invokeArgs;
    if (calls === undefined) {
        invokeArgs[0] = calls = [];
    }
    calls.push(callArgs);
    return [calls];
};
