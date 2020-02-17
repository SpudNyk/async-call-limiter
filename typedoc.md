# async-wrappers

## Wrapper Functions

 - [[debounce]] - Only call a function after no calls have ocurred for a
   specified interval.
 - [[throttle]] - Don't call a function faster than a specified interval.
 - [[retry]] - Attempt to call a function until it succeeds.
 - [[wait]] Wait specified time for a value.

## Argument Reducers

A set of premade [[ArgumentsReducer|reducer]] functions are included.
These can be used by the reducer option on [[debounce]] and [[throttle]] to
determine what the arguments to the wrapped function should be.

 - [[latestArguments|latest]] - Uses only the latest called arguments.
 - [[combineArguments|combine]] - Combines all arguments into a single array.
 - [[callArguments|calls]] - Combines all calls into an array of call arguments.
 - [[extendArguments|extend]] - Combines call arguments by concatenating them into a set of arguments.

