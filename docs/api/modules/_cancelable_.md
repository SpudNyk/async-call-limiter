[async-call-limiter](../README.md) › ["cancelable"](_cancelable_.md)

# External module: "cancelable"

## Index

### Functions

* [cancelable](_cancelable_.md#const-cancelable)

## Functions

### `Const` cancelable

▸ **cancelable**<**T**>(`promise`: Promise‹T›, `canceller?`: [CancelFunction](../interfaces/_types_.cancelfunction.md)): *Promise‹T› & [Cancelable](../interfaces/_types_.cancelable.md)*

*Defined in [cancelable.ts:15](https://github.com/SpudNyk/async-call-limiter/blob/a5b269b/src/cancelable.ts#L15)*

Wraps a promise that can be cancelled by calling it's cancel function
If the promise settles then call
Cancelling a promise causes it to reject with the given reason or Cancelled

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`promise` | Promise‹T› | The promise to wrap. |
`canceller?` | [CancelFunction](../interfaces/_types_.cancelfunction.md) | A function to call that will cause the wrapped promise to reject. This can be used to abort transactions etc.  |

**Returns:** *Promise‹T› & [Cancelable](../interfaces/_types_.cancelable.md)*

A cancellable promise.
