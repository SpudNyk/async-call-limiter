import delay from './delay';
import cancelable from './cancelable';

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

const createWaitAfterFn = times => {
    if (typeof times === 'function') {
        return times;
    }
    return attempt => times[Math.min(attempt, times.length - 1)];
};

const createShouldStopFn = stop => {
    if (typeof stop === 'function') {
        return stop;
    }
    return attempt => attempt >= stop;
};

const retry = (fn, waitTimes = defaultWaitTimes, stop = 10) => {
    const getWaitAfter = createWaitAfterFn(waitTimes);
    const shouldStop = createShouldStopFn(stop);
    let attempt = 0;
    let cancelReason = null;
    let sleeping = null;
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
                sleeping = null;
            }
        }
        // handle cancels after waiting for value or sleeping
        if (cancelReason) {
            throw cancelReason;
        }
    };

    return cancelable(exec(), reason => {
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
