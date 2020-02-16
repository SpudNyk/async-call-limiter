import pending from './pending';
import { CancelablePromise } from './types';
import deferred from './deferred';

type ResolverFunction<T> = () => T | PromiseLike<T>;
type Resolver<T> = T | PromiseLike<T> | ResolverFunction<T>;

export interface Waiting<T> extends CancelablePromise<T> {
    /**
     * Stops waiting
     * this will cause any waiting values to be resolved on the next runtime loop.
     */
    stop: () => void;
}

/**
 * Resolves after a given delay, optionally with a value.
 *
 * If the delay is `0` the promises will resolve after the current
 * runtime event loop.
 *
 * @param delay The time in milliseconds before the value is returned.
 * @param value An optional value to return after sleeping. 
 * If a function is supplied it will be executed after the delay and it's
 * value is returned.
 *
 * @returns A promise that resolves with the value/function result.
 * The promise has 2 extra functions defined:
 *  - `cancel` cancels the result and rejects the promise.
 *  - `stop` stops waiting and resolves the promised value.
 */
const wait = <T = void>(delay: number, value?: Resolver<T>): Waiting<T> => {
    const result = pending<T>();
    const execute = deferred(() => {
        // @ts-ignore
        result.complete(typeof value === 'function' ? value() : value);
    });
    execute.defer(delay);
    const promise = result.promise as Waiting<T>;
    promise.cancel = (error?: Error) => {
        execute.cancel();
        result.error(error ? error : new Error('Cancelled'));
    };
    promise.stop = () => {
        // execute has already finished
        if (execute.delay < 0) {
            return;
        }
        // call right away
        execute.defer(0);
    };
    return promise;
};

export default wait;
