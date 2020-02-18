import wait, { WaitResult } from './wait';

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

/**
 * Function for determining a how long to wait after the given attempt
 *
 * @category Retry
 */
type RetryDelayCallback =
    /**
     * @param attempt The current attempt number.
     * @param previousDelay The previous delay.
     * @param error The error from the current attempt.
     * @return The new delay in milliseconds.
     */
    (
        attempt: number,
        previousDelay: number,
        error: any
    ) => number | PromiseLike<number>;

/**
 * A delay, list of delays or [[RetryNextDelayFunction|callback]] for
 * [[retry]] to use when determining the delay between attempts.
 *
 * @category Retry
 */
type RetryDelay = RetryDelayCallback | number[] | number;

/**
 * @internal
 */
const getDelayFn = (times: RetryDelay): RetryDelayCallback => {
    if (typeof times === 'function') {
        return times;
    }
    if (typeof times === 'number') {
        return (): number => times;
    }
    return (attempt: number): number =>
        times[Math.min(attempt, times.length - 1)];
};

/**
 * A function used to determine if to stop for the given retry attempt.
 *
 * Errors thrown by this function will cause retry to reject with the
 * errorTypes of retry errors
 *
 * @category Retry
 */
type RetryStopCallback =
    /**
     * @param nextAttempt The attempt number for the next try.
     * @param delay The current delay before retrying.
     * @param error The error from the current attempt.
     * @return true or a message to stop trying and reject with the given
     * message.
     */
    (nextAttempt: number, delay: number, error: any) => boolean | string;

/**
 * The number of calls or [[RetryStopCallback|callback]] for [[retry]] to use when determining
 * to stop retrying.
 *
 * @category Retry
 */
type RetryStop = RetryStopCallback | number;
/**
 * @internal
 */
const getStopFn = (stop: RetryStop): RetryStopCallback => {
    if (typeof stop === 'function') {
        return stop;
    }
    return (attempt): boolean => attempt >= stop;
};

/**
 * callback for [[retry]] to determine the arguments to
 * the function to retry.
 * @typeparam RetryFunction the type of function to retry.
 *
 * @category Retry
 */
export type RetryArgumentsCallback<
    RetryFunction extends (...args: any[]) => any
> =
    /**
     * @param attempt The attempt number for the next try.
     * @param delay The current delay before retrying.
     * @param error The error from the current attempt.
     * @return The arguments for the function
     */
    (
        attempt: number,
        delay: number,
        error: any
    ) => Parameters<RetryFunction> | Promise<Parameters<RetryFunction>>;

/**
 * An array of arguments or [[RetryArgumentsCallback|callback]] for [[retry]]
 * to use when calling it's function
 *
 * @category Retry
 */
export type RetryArguments<F extends (...args: any[]) => any> =
    | Parameters<F>
    | RetryArgumentsCallback<F>;

/**
 * @internal
 */
const getArgsFn = <F extends (...args: any[]) => any>(
    args: RetryArguments<F>
): RetryArgumentsCallback<F> => {
    if (typeof args === 'function') {
        return args;
    }
    return (): Parameters<F> => args;
};

/**
 * Types of retry errors
 *
 * @category Retry
 */
export type RetryErrorTypes = 'cancelled' | 'stopped';

/**
 * Base Class for all retry errors
 *
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
 *
 * @category Retry
 */
export class RetryCancelledError extends RetryError {
    constructor(message = 'Cancelled', error?: any) {
        super('cancelled', message, error);
    }
}

/**
 * The error given when retrying stops
 *
 * @category Retry
 */
export class RetryStoppedError extends RetryError {
    constructor(message = 'Stopped', error?: any) {
        super('stopped', message, error);
    }
}
/**
 * The return type of [[retry]]
 *
 * @category Retry
 */
export interface RetryResult<F extends (...args: any[]) => any>
    extends Promise<ReturnType<F> | void> {
    /**
     * Cancels retrying.
     *
     * @param reason Optional reason to reject results with.
     */

    cancel: (reason?: string) => void;
}

/**
 * Retry the wrapped function according to the
 *
 * @param func the function to retry.
 * @param delay a delay in milliseconds, an array of millisecond delays or
 * [[RetryDelayCallback|callback]] to determine the delay before the next
 * attempt.
 *
 * @param stop the number of attempts, or [[RetryStopCallback|callback]] to
 * determine when retry should stop retrying `func`.
 * @param args an array or [[RetryArgumentsCallback|callback]] to
 * provide arguments to `func`
 *
 * @category Wrapper
 */
const retry = (
    func: (...args: any[]) => any,
    delay: RetryDelay = defaultDelays,
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
    let waiting: WaitResult<null> | undefined;
    let previousDelay = 0;
    let currentError: any;

    const afterAwait = (): void => {
        if (finished || !cancelled) {
            return;
        }
        throw new RetryCancelledError(cancelReason, currentError);
    };

    const exec = async (): Promise<ReturnType<typeof func>> => {
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
    result.cancel = (reason?: string): void => {
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
