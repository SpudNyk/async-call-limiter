[async-call-limiter](../README.md) › ["retry"](../modules/_retry_.md) › [WaitTimeFunction](_retry_.waittimefunction.md)

# Interface: WaitTimeFunction

Function for determining a how long to wait after the given attempt

## Hierarchy

* **WaitTimeFunction**

## Callable

▸ (`attempt`: number): *number*

*Defined in [retry.ts:21](https://github.com/SpudNyk/async-call-limiter/blob/a5b269b/src/retry.ts#L21)*

Function for determining a how long to wait after the given attempt

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`attempt` | number | The number of attempts tried |

**Returns:** *number*

The wait time in milliseconds
