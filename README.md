# async-call-limiter

A set of functions useful in an async/await environment.

## Description

These functions are similar to others debounce and throttle functions. e.g. [Lodash's](https://lodash.com): [debounce](https://lodash.com/docs/4.17.15#debounce) and [throttle](https://lodash.com/docs/4.17.15#throttle).
However these functions differ in that the resulting function when called returns a promise that will resolve/reject when the wrapped function is invoked. The functions also can take an "argument reducer" function that determines the arguments that will be given to wrapped function.
The default reducer implementation just uses the last arguments given, however you can use this to merge arguments so the wrapped function can handle all calls. This could be useful wrapping a request for specific items to merge multiple calls into one request.

## Documentation

- [API](https://spudnyk.github.io/async-call-limiter/api/)
