/**
 * An {@link argumentsReducer} that always uses the latest given arguments
 * @param {Array} current The current arguments
 * @param {Array} next The next arguments
 * @returns {Array} The new arguments
 */
const latestArgumentsReducer = (current, next) => next;

export default latestArgumentsReducer;
