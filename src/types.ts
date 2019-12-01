export interface BaseFunction {
    (...args: any[]): any;
}

export interface CancelFunction {
    (error?: Error): void;
}

export interface Cancelable {
    cancel: CancelFunction
}

export type CancelablePromise<T> = Promise<T> & Cancelable;

export interface CancelableFunction extends BaseFunction {
    cancel: CancelFunction;
}
