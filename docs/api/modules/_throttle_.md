[async-call-limiter](../README.md) › ["throttle"](_throttle_.md)

# External module: "throttle"

## Index

### Type aliases

* [Throttled](_throttle_.md#throttled)

### Functions

* [throttle](_throttle_.md#const-throttle)

## Type aliases

###  Throttled

Ƭ **Throttled**: *[CallFunction](_callreduce_.md#callfunction)‹F, CallArgs› & [Cancelable](../interfaces/_types_.cancelable.md)*

## Functions

### `Const` throttle

▸ **throttle**<**Invoke**, **CallArgs**>(`fn`: Invoke, `delay`: number, `argumentsReducer?`: [ArgumentsReducer](../interfaces/_callreduce_.argumentsreducer.md)‹Parameters‹Invoke›, CallArgs›, `onCancel?`: undefined | function): *[Throttled](_throttle_.md#throttled)‹Invoke, CallArgs›*

Ensure multiple calls to a function will only execute it at most once every `delay` milliseconds.
The result of the call will be returned as a promise to the caller.

**Type parameters:**

▪ **Invoke**: *[InvokeFunction](../interfaces/_callreduce_.invokefunction.md)*

▪ **CallArgs**: *any[]*

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`fn` | Invoke | - | The function to throttle |
`delay` | number | 50 | The number of milliseconds between functions. |
`argumentsReducer?` | [ArgumentsReducer](../interfaces/_callreduce_.argumentsreducer.md)‹Parameters‹Invoke›, CallArgs› | - | Used to determine the arguments when `fn` is invoked. This will be called every time the throttled function is called. If not supplied the default implementation of only using the latest arguments will be used. |
`onCancel?` | undefined &#124; function | - | If supplied this function will be called if the throttled function is cancelled.  |

**Returns:** *[Throttled](_throttle_.md#throttled)‹Invoke, CallArgs›*
