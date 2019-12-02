[async-call-limiter](../README.md) › ["callReduce"](../modules/_callreduce_.md) › [ArgumentsReducer](_callreduce_.argumentsreducer.md)

# Interface: ArgumentsReducer <**InvokeArgs, CallArgs**>

reducer used to create the invocation arguments for a function call.

## Type parameters

▪ **InvokeArgs**: *any[]*

▪ **CallArgs**: *any[]*

## Hierarchy

* **ArgumentsReducer**

## Callable

▸ (`invokeArgs`: InvokeArgs, `callArgs`: CallArgs): *InvokeArgs*

*Defined in [callReduce.ts:14](https://github.com/SpudNyk/async-call-limiter/blob/a5b269b/src/callReduce.ts#L14)*

reducer used to create the invocation arguments for a function call.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`invokeArgs` | InvokeArgs | The current invocation arguments for the main function. |
`callArgs` | CallArgs | The arguments given to the latest call. |

**Returns:** *InvokeArgs*

The new invocation arguments.
