[async-call-limiter](../README.md) › ["retry"](../modules/_retry_.md) › [StopFn](_retry_.stopfn.md)

# Interface: StopFn

Function for determining a how long to wait after the given attempt

## Hierarchy

* **StopFn**

## Callable

▸ (`attempt`: number, `wait`: number, `error`: Error): *boolean*

Function for determining a how long to wait after the given attempt

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`attempt` | number | The number of attempts tried |
`wait` | number | - |
`error` | Error | - |

**Returns:** *boolean*

The wait time in milliseconds
