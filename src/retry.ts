import wait, { Waiting } from './wait';
import { BaseFunction } from './types';

/**
 * @internal
 */
const defaultDelays = [
    // 10 seconds
    10 * 1000,
    // 1 Minute
    60 * 1000,
    // 5 Minutes
    5 * 60 * 1000,
    // 10 Minutes
    10 * 60 * 1000
];

interface RetryNextDelayFunction {
    /**
     * Function for determining a how long to wait after the given attempt
     * @param attempt The current attempt number.
     * @param previousDelay The previous delay.
     * @param error The error from the current attempt.
     * @return The new delay in milliseconds.
     */
    (attempt: number, previousDelay: number, error: any):
        | number
        | PromiseLike<number>;
}

type RetryDelays = RetryNextDelayFunction | number[] | number;

/**
 * @internal
 */
const getDelayFn = (times: RetryDelays): RetryNextDelayFunction => {
    if (typeof times === 'function') {
        return times;
    }
    if (typeof times === 'number') {
        return () => times;
    }
    return (attempt: number) => times[Math.min(attempt, times.length - 1)];
};

interface RetryStopFunction {
    /**
     * Function for determining if to stop for the given attempt
     *
     * Errors thrown by this function will cause retry to reject with the
     * error.
     *
     * @param nextAttempt The attempt number for the next try.
     * @param delay The current delay before retrying.
     * @param error The error from the current attempt.
     * @return true or a message to stop trying and reject with the given
     * message.
     */
    (nextAttempt: number, delay: number, error: any): boolean | string;
}

type RetryStop = RetryStopFunction | number;
/**
 * @internal
 */
const getStopFn = (stop: RetryStop): RetryStopFunction => {
    if (typeof stop === 'function') {
        return stop;
    }
    return attempt => attempt >= stop;
};

export interface RetryArgumentsCallback<F extends BaseFunction> {
    /**
     *
     */
    (attempt: number, delay: number, error: any):
        | Parameters<F>
        | Promise<Parameters<F>>;
}

export type RetryArguments<F extends BaseFunction> =
    | Parameters<F>
    | RetryArgumentsCallback<F>;

/**
 * @internal
 */
const getArgsFn = <F extends BaseFunction>(
    args: RetryArguments<F>
): RetryArgumentsCallback<F> => {
    if (typeof args === 'function') {
        return args;
    }
    return () => args;
};

/**
 * Types of retry errors
 * @category Retry
 */
export type RetryErrorTypes = 'cancelled' | 'stopped';

/**
 * Base Class for all retry errors
 * @category Retry
 */
export class RetryError extends Error {
    /**
     * The type of error
     */
    type: RetryErrorTypes;
    /**
     * The last error that occurred when retrying
     */
    error?: any;
    constructor(type: RetryErrorTypes, message: string, error: any) {
        super(message);
        this.type = type;
        this.error = error;
    }
}

/**
 * The error given when retrying is cancelled
 * @category Retry
 */
export class RetryCancelledError extends RetryError {
    constructor(message: string = 'Cancelled', error?: any) {
        super('cancelled', message, error);
    }
}

/**
 * The error given when retrying stops
 * @category Retry
 */
export class RetryStoppedError extends RetryError {
    constructor(message: string = 'Stopped', error?: any) {
        super('stopped', message, error);
    }
}

export interface RetryResult<F extends BaseFunction>
    extends Promise<ReturnType<F> | void> {
    /**
     * Cancels pending function execution.
     * Pending results will be rejected.
     * @param reason Optional reason to reject results with.
     */

    cancel: (reason?: string) => void;
}

/**
 *
 * @param func the function to retry
 * @param delay A delay in milliseconds or an array of millisecond delays
 * @param stop The number of attempts or function to determine when retry
 * should stop retrying `func`.
 * @param args arguments to use for the base function
 *
 * @category Wrapper
 * @category Retry
 */
const retry = (
    func: BaseFunction,
    delay: RetryDelays = defaultDelays,
    stop: RetryStop = 10,
    args: RetryArguments<typeof func> = ([] as unknown) as Parameters<
        typeof func
    >
): RetryResult<typeof func> => {
    const getNextDelay = getDelayFn(delay);
    const shouldStop = getStopFn(stop);
    const getArgs = getArgsFn<typeof func>(args);
    let attempt = 0;
    let finished = false;
    let cancelled = false;
    let cancelReason: string | undefined;
    let waiting: Waiting<null> | undefined;
    let previousDelay = 0;
    let currentError: any;

    const afterAwait = () => {
        if (finished || !cancelled) {
            return;
        }
        throw new RetryCancelledError(cancelReason, currentError);
    };

    const exec = async () => {
        while (!cancelled) {
            const args = await getArgs(attempt, previousDelay, currentError);
            afterAwait();
            try {
                const value = await func(...args);
                finished = true;
                return value;
            } catch (error) {
                currentError = error;
                afterAwait();
                // how long to wait after the last attempt
                const delay = await getNextDelay(attempt, previousDelay, error);
                afterAwait();
                previousDelay = delay;
                attempt++;
                const stop = await shouldStop(attempt, delay, error);
                afterAwait();
                // should we stop the next attempt?
                if (stop) {
                    const reason = typeof stop === 'string' ? stop : undefined;
                    finished = true;
                    throw new RetryStoppedError(reason, error);
                }
                waiting = wait(delay);
                await waiting;
                waiting = undefined;
                afterAwait();
            }
        }
    };

    const result = exec() as RetryResult<typeof func>;
    result.cancel = (reason?: string) => {
        if (finished || cancelled) {
            return;
        }
        cancelled = true;
        cancelReason = reason;
        if (waiting) {
            waiting.stop();
        }
    };
    return result;
};

export default retry;
