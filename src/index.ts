export { default as debounce } from './debounce';
export { default as throttle } from './throttle';
export { default as wait } from './wait';
export { default as retry } from './retry';
export {
    latestArguments,
    combineArguments,
    callArguments,
    extendArguments
} from './callReducers';

// The following safely reexport types when transpiling.
// This should be easier when typescript 3.8 releases
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/#type-only-imports-exports
import { CallFunction as CF } from './callReduce';
export type CallFunction<F extends (...args: any[]) => any, Args extends any[]> = CF<
    F,
    Args
>;
import { ArgumentsReducer as AR, ReducerFunction as RF } from './callReducers';
export type ArgumentsReducer<
    InvokeArgs extends any[] = any[],
    CallArgs extends any[] = any[]
> = AR<InvokeArgs, CallArgs>;
type FuncOrArray = (...args: any[]) => any | any[];
export type ReducerFunction<
    IF extends (...args: any[]) => any,
    CallFuncOrArgs extends FuncOrArray = IF
> = RF<IF, CallFuncOrArgs>;

import { Debounced as DB } from './debounce';
export type Debounced<F extends (...args: any[]) => any, R extends RF<F, any>> = DB<F, R>;
import { Throttled as TH } from './throttle';
export type Throttled<F extends (...args: any[]) => any, R extends RF<F, any>> = TH<F, R>;
