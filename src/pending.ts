const throwSettled = () => {
    throw new Error('pending cannot be changed after it has settled');
};

/**
 * Used to hold a pending result
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
    error(err?: Error): Promise<T>;
    /**
     * complete the result
     * @param result the final result
     */
    complete(result: T): Promise<T>;
}

/**
 * create a waiting empty result
 */
const pending = <T>() => {
    const value = {} as Pending<T>;
    value.promise = new Promise((resolve, reject) => {
        value.complete = arg => {
            resolve(arg);
            reject = resolve = throwSettled;
            return value.promise;
        };
        value.error = err => {
            reject(err);
            reject = resolve = throwSettled;
            return value.promise;
        };
    });
    return value;
};

export default pending;
