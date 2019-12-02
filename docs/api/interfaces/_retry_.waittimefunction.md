[async-call-limiter](../README.md) › ["retry"](../modules/_retry_.md) › [WaitTimeFunction](_retry_.waittimefunction.md)

# Interface: WaitTimeFunction

Function for determining a how long to wait after the given attempt

## Hierarchy

* **WaitTimeFunction**

## Callable

▸ (`attempt`: number): *number*

Function for determining a how long to wait after the given attempt

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`attempt` | number | The number of attempts tried |

**Returns:** *number*

The wait time in milliseconds
