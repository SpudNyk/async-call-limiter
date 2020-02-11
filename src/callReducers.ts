import { BaseFunction } from './types';

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
    F extends BaseFunction,
    CallArgs extends any[] = Parameters<F>
> = ArgumentsReducer<Parameters<F>, CallArgs>;

export type ReducerCallParameters<
    Reducer extends ArgumentsReducer<any, any> | undefined,
    D = never
> = Reducer extends (i: any, call: infer Args) => any ? Args : D;

/**
 * An arguments Reducer that uses the latest arguments given to the call
 * function as the arguments for the invoke function.
 * @param invokeArgs
 * @param callArgs
 */
export const latestArguments = <T extends any[]>(
    invokeArgs: T,
    callArgs: T
): T => callArgs;

/**
 * An arguments reducer that combines all arguments to the call function into
 * a single array given as the first argument to the invoke function.
 * @param invokeArgs arguments to invocation function
 * @param callArgs
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
