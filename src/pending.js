const throwCompleted = () => {
    throw new Error('pending cannot be changed when completed');
};
const throwError = () => {
    throw new Error('pending cannot be changed when in error');
};

const pending = () => {
    const value = {};
    value.promise = new Promise((resolve, reject) => {
        value.complete = arg => {
            resolve(arg);
            resolve = throwCompleted;
            reject = throwCompleted;
        };
        value.error = err => {
            reject(err);
            resolve = throwError;
            reject = throwError;
        };
    });
    return value;
};

export default pending;
