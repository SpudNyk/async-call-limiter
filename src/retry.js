import delay from './delay';

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
    let cancelled = false;
    let paused = null;
    let complete = false;
    const exec = async () => {
        while (!cancelled) {
            try {
                const result = await fn();
                if (cancelled) {
                    throw new Error('Aborted');
                }
                complete = true;
                return result;
            } catch (error) {
                if (cancelled) {
                    throw new Error('Aborted');
                }
                // how long to wait after the last attempt
                const wait = getWaitAfter(attempt);
                attempt++;
                // should we stop the next attempt?
                if (shouldStop(attempt, wait, error)) {
                    throw error;
                }
                paused = delay(null, wait);
                await paused;
            }
        }
    };
    const attempting = exec();
    attempting.cancel = reason => {
        if (complete) {
            throw new Error('Already Completed');
        }
        if (cancelled) {
            throw new Error('Already Cancelled');
        }
        cancelled = true;
        if (paused) {
            paused.cancel(reason ? reason : new Error('Cancelled'));
        }
    };
    return attempting;
};

export default retry;
