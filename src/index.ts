export { default as debounce } from './debounce';
export { default as throttle } from './throttle';
export { default as wait } from './wait';
export { default as retry } from './retry';
export {
    latestArguments,
    combineArguments,
    callArguments
} from './callReducers';

// The following safely reexport types when transpiling.
// This should be easier when typescript 3.8 releases
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/#type-only-imports-exports
import { BaseFunction } from './types';
import { CallFunction as CF } from './callReduce';
export type CallFunction<F extends BaseFunction, Args extends any[]> = CF<
    F,
    Args
>;
import { ArgumentsReducer as AR, ReducerFunction as RF } from './callReducers';
export type ArgumentsReducer<
    InvokeArgs extends any[] = any[],
    CallArgs extends any[] = any[]
> = AR<InvokeArgs, CallArgs>;
type FuncOrArray = BaseFunction | any[];
export type ReducerFunction<
    InvokeFunc extends BaseFunction,
    CallFuncOrArgs extends FuncOrArray = InvokeFunc
> = RF<InvokeFunc, CallFuncOrArgs>;

import { Debounced as DB } from './debounce';
export type Debounced<F extends BaseFunction, R extends RF<F, any>> = DB<F, R>;
import { Throttled as TH } from './throttle';
export type Throttled<F extends BaseFunction, R extends RF<F, any>> = TH<F, R>;
