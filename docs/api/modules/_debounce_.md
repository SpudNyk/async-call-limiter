[async-call-limiter](../README.md) › ["debounce"](_debounce_.md)

# External module: "debounce"

## Index

### Type aliases

* [Debounced](_debounce_.md#debounced)

### Functions

* [debounce](_debounce_.md#const-debounce)

## Type aliases

###  Debounced

Ƭ **Debounced**: *[CallFunction](_callreduce_.md#callfunction)‹F, CallArgs› & [Cancelable](../interfaces/_types_.cancelable.md)*

The debounced function

## Functions

### `Const` debounce

▸ **debounce**<**Invoke**, **CallArgs**>(`fn`: Invoke, `delay`: number, `argumentsReducer?`: [ArgumentsReducer](../interfaces/_callreduce_.argumentsreducer.md)‹Parameters‹Invoke›, CallArgs›, `maxDelay`: number, `onCancel?`: undefined | function): *[Debounced](_debounce_.md#debounced)‹Invoke, CallArgs›*

Ensure multiple calls to a function will only execute it once no more calls have happend for `delay` milliseconds.
The result of the call will be returned as a promise to the caller.

**Type parameters:**

▪ **Invoke**: *[InvokeFunction](../interfaces/_callreduce_.invokefunction.md)*

▪ **CallArgs**: *any[]*

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`fn` | Invoke | - | The function to debounce |
`delay` | number | 50 | The number of milliseconds on inactivity before the function will be called. |
`argumentsReducer?` | [ArgumentsReducer](../interfaces/_callreduce_.argumentsreducer.md)‹Parameters‹Invoke›, CallArgs› | - | Used to determine the arguments when `fn` is invoked. This will be called every time the debounced function is called. If not supplied the default implementation of only using the latest arguments will be used. |
`maxDelay` | number | 0 | The maximum number of milliseconds before the function will be called. If this is not 0 then the function will be called after the elapsed time. |
`onCancel?` | undefined &#124; function | - | - |

**Returns:** *[Debounced](_debounce_.md#debounced)‹Invoke, CallArgs›*

the debounced function
