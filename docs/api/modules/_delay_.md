[async-call-limiter](../README.md) › ["delay"](_delay_.md)

# External module: "delay"

## Index

### Functions

* [delay](_delay_.md#const-delay)

## Functions

### `Const` delay

▸ **delay**<**T**>(`value`: T, `wait`: number): *[CancelablePromise](_types_.md#cancelablepromise)‹T›*

Promises a given value/or function call result after a given wait

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`value` | T | The value or function to return after the delay. If a function is supplied it is executed after the wait and it's result is returned. |
`wait` | number | The wait time in milliseconds before the value is returned. |

**Returns:** *[CancelablePromise](_types_.md#cancelablepromise)‹T›*

A cancelable promise that resolves with the value/function result.
The promise also has a `cancel` function to allow canceling the result.
This can be called before the wait is over to reject the promise and not
execute any pending functions.
