const throwSettled = () => {
    throw new Error('pending cannot be changed after it has settled');
};

const pending = () => {
    const value = {};
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
