import delay from './delay';
import cancelable from './cancelable';
import { BaseFunction, CancelablePromise } from './types';

const defaultWaitTimes = [
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
 * @param attempt The number of attempts tried
 * @return The wait time in milliseconds
 */
interface WaitTimeFunction {
    (attempt: number): number;
}

type WaitTimes = WaitTimeFunction | number[] | number;

const createWaitAfterFn = (times: WaitTimes): WaitTimeFunction => {
    if (typeof times === 'function') {
        return times;
    }
    if (typeof times === 'number') {
        return () => times;
    }
    return (attempt: number) => times[Math.min(attempt, times.length - 1)];
};

/**
 * Function for determining a how long to wait after the given attempt
 * @param attempt The number of attempts tried
 * @return The wait time in milliseconds
 */
interface StopFn {
    (attempt: number, wait: number, error: Error): boolean;
}

type Stop = StopFn | number;

const createShouldStopFn = (stop: Stop): StopFn => {
    if (typeof stop === 'function') {
        return stop;
    }
    return attempt => attempt >= stop;
};

const retry = (
    fn: BaseFunction,
    waitTimes: WaitTimes = defaultWaitTimes,
    stop: Stop = 10
) => {
    const getWaitAfter = createWaitAfterFn(waitTimes);
    const shouldStop = createShouldStopFn(stop);
    let attempt = 0;
    let cancelReason: Error | undefined;
    let sleeping: CancelablePromise<null> | undefined;
    const exec = async () => {
        while (!cancelReason) {
            try {
                const value = await fn();
                if (!cancelReason) {
                    return value;
                }
            } catch (error) {
                // handle cancels after an error
                if (cancelReason) {
                    throw cancelReason;
                }
                // how long to wait after the last attempt
                const wait = getWaitAfter(attempt);
                attempt++;
                // should we stop the next attempt?
                if (shouldStop(attempt, wait, error)) {
                    throw error;
                }
                sleeping = delay(null, wait);
                await sleeping;
                // eslint-disable-next-line require-atomic-updates
                sleeping = undefined;
            }
        }
        // handle cancels after waiting for value or sleeping
        if (cancelReason) {
            throw cancelReason;
        }
    };

    return cancelable(exec(), (reason?: Error) => {
        if (cancelReason) {
            return;
        }
        cancelReason = reason;
        if (sleeping) {
            sleeping.cancel(reason);
        }
    });
};

export default retry;
