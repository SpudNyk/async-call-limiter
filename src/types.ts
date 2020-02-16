export interface BaseFunction {
    (...args: any[]): any;
}

export interface CancelFunction {
    (error?: Error): void;
}

// export interface Cancelable {
//     cancel: CancelFunction
// }

export interface CancelablePromise<T> extends Promise<T> {
    /**
     * Causes the promise to reject.
     * @param error If suplied this will be the error the promise rejects with.
     */
    cancel: (error?: Error) => void;
}

export interface CancelableFunction extends BaseFunction {
    cancel: CancelFunction;
}
