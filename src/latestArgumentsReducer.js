/**
 * @callback argumentsReducer
 * Combines multiple debounced function call arguments into a single list for the actual
 * execution of the function.
 * @param {*[]} current The current reduced arguments (empty for the initial call).
 * @param {*[]} next The next arguments.
 * @returns {*[]} The new reduced arguments.
 */

/**
 * An arguments reducer that always uses the latest given arguments
 * @param {*[]} current The current arguments
 * @param {*[]} next The next arguments
 * @returns {*[]} The new arguments
 */
const latestArgumentsReducer = (current, next) => next;

export default latestArgumentsReducer;
