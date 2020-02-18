/**
 * @internal
 */
const throwSettled = (): void => {
    throw new Error('pending cannot be changed after it has settled');
};

/**
 * Used to hold a pending result
 * @internal
 */
export interface Pending<T> {
    /**
     * Holds the promise that will resolve with the result value.
     */
    promise: Promise<T>;
    /**
     * Indicate an error occurred
     * @param err
     */
    error(err?: any): Promise<T>;
    /**
     * complete the result
     * @param result the final result
     */
    complete(result: T | PromiseLike<T>): Promise<T>;
}

/**
 * create a waiting empty result
 * @internal
 */
const pending = <T>(): Pending<T> => {
    const value = {} as Pending<T>;
    value.promise = new Promise((resolve, reject) => {
        value.complete = (arg): Promise<T> => {
            resolve(arg);
            reject = resolve = throwSettled;
            return value.promise;
        };
        value.error = (err): Promise<T> => {
            reject(err);
            reject = resolve = throwSettled;
            return value.promise;
        };
    });
    return value;
};

export default pending;
