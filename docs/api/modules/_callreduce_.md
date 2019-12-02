[async-call-limiter](../README.md) › ["callReduce"](_callreduce_.md)

# External module: "callReduce"

## Index

### Interfaces

* [ArgumentsReducer](../interfaces/_callreduce_.argumentsreducer.md)
* [InvokeFunction](../interfaces/_callreduce_.invokefunction.md)

### Type aliases

* [CallFunction](_callreduce_.md#callfunction)
* [ReducerFunction](_callreduce_.md#reducerfunction)

### Functions

* [callReduce](_callreduce_.md#const-callreduce)
* [latestArgumentsReducer](_callreduce_.md#const-latestargumentsreducer)
* [noop](_callreduce_.md#const-noop)

## Type aliases

###  CallFunction

Ƭ **CallFunction**: *function*

#### Type declaration:

▸ (...`args`: Args): *Promise‹ReturnType‹F››*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | Args |

___

###  ReducerFunction

Ƭ **ReducerFunction**: *[ArgumentsReducer](../interfaces/_callreduce_.argumentsreducer.md)‹Parameters‹F›, CallArgs›*

## Functions

### `Const` callReduce

▸ **callReduce**<**Invoke**, **CallArgs**, **Reducer**>(`fn`: Invoke, `callReducer?`: [Reducer](undefined), `onBeforeReduce`: [InvokeFunction](../interfaces/_callreduce_.invokefunction.md), `onAfterReduce`: [InvokeFunction](../interfaces/_callreduce_.invokefunction.md)): *[[CallFunction](_callreduce_.md#callfunction)‹Invoke, CallArgs›, function, function]*

Utility function that wraps a function and will use a reducer to combine the arguments
of multiple calls to that function. As the function is not executed until it is invoked
a promise for the result is returned to the callers.

**Type parameters:**

▪ **Invoke**: *[InvokeFunction](../interfaces/_callreduce_.invokefunction.md)*

▪ **CallArgs**: *any[]*

▪ **Reducer**: *[ReducerFunction](_callreduce_.md#reducerfunction)‹Invoke, CallArgs›*

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`fn` | Invoke | - | The function to wrap. |
`callReducer?` | [Reducer](undefined) | - | Used to determine the arguments when `fn` is invoked. This will be called every time the wrapped function is called. If not supplied the default implementation of only using the latest arguments will be used. |
`onBeforeReduce` | [InvokeFunction](../interfaces/_callreduce_.invokefunction.md) |  noop | If supplied this function will be called before the reducer is called. |
`onAfterReduce` | [InvokeFunction](../interfaces/_callreduce_.invokefunction.md) |  noop | If supplied this function will be called if the wrapped function is cancelled. |

**Returns:** *[[CallFunction](_callreduce_.md#callfunction)‹Invoke, CallArgs›, function, function]*

___

### `Const` latestArgumentsReducer

▸ **latestArgumentsReducer**<**T**>(`invokeArgs`: T, `callArgs`: T): *T*

**Type parameters:**

▪ **T**: *any[]*

**Parameters:**

Name | Type |
------ | ------ |
`invokeArgs` | T |
`callArgs` | T |

**Returns:** *T*

___

### `Const` noop

▸ **noop**(): *void*

**Returns:** *void*
