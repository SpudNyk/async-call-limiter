import pending from './pending';
import deferred from './deferred';

/**
 * A callback that will return a value after [[wait]] is completed.
 *
 * @typeparam T the type of the value.
 *
 * @category Wait
 */
type WaitValueCallback<T> =
    /**
     * @returns the value or promise to return the value
     */
    () => T | PromiseLike<T>;

/**
 * A value or [[WaitValueCallback|callback]] that will return the value for
 * [[wait]].
 *
 * @typeparam T the type of the value.
 *
 * @category Wait
 */
type WaitValue<T> = T | PromiseLike<T> | WaitValueCallback<T>;

/**
 * A promise will resolve with a value when [[wait]] is complete.
 *
 * @typeparam T the type of the value.
 *
 * @category Wait
 */
export interface WaitResult<T> extends Promise<T> {
    /**
     * Causes the promise to reject.
     * @param error If suplied this will be the error the promise rejects with.
     */
    cancel: (error?: Error) => void;
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
 * @param func A function or value that will be returned after waiting.
 *
 * @returns A promise that resolves with the value/function result.
 * The promise has 2 extra functions defined:
 *  - `cancel` cancels the result and rejects the promise.
 *  - `stop` stops waiting and resolves the promised value.
 *
 * @category Wrapper
 */
const wait = <T = void>(delay: number, func?: WaitValue<T>): WaitResult<T> => {
    const result = pending<T>();
    const execute = deferred(() => {
        // Typescript doesn't accept the function type guard here
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        result.complete(typeof func === 'function' ? func() : func);
    });
    execute.defer(delay);
    const promise = result.promise as WaitResult<T>;
    promise.cancel = (error?: Error): void => {
        execute.cancel();
        result.error(error ? error : new Error('Cancelled'));
    };
    promise.stop = (): void => {
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
