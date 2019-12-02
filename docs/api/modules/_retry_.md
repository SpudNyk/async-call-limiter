[async-call-limiter](../README.md) › ["retry"](_retry_.md)

# External module: "retry"

## Index

### Interfaces

* [StopFn](../interfaces/_retry_.stopfn.md)
* [WaitTimeFunction](../interfaces/_retry_.waittimefunction.md)

### Type aliases

* [Stop](_retry_.md#stop)
* [WaitTimes](_retry_.md#waittimes)

### Variables

* [defaultWaitTimes](_retry_.md#const-defaultwaittimes)

### Functions

* [createShouldStopFn](_retry_.md#const-createshouldstopfn)
* [createWaitAfterFn](_retry_.md#const-createwaitafterfn)
* [retry](_retry_.md#const-retry)

## Type aliases

###  Stop

Ƭ **Stop**: *[StopFn](../interfaces/_retry_.stopfn.md) | number*

___

###  WaitTimes

Ƭ **WaitTimes**: *[WaitTimeFunction](../interfaces/_retry_.waittimefunction.md) | number[] | number*

## Variables

### `Const` defaultWaitTimes

• **defaultWaitTimes**: *number[]* =  [
    // 10 seconds
    10 * 1000,
    // 1 Minute
    60 * 1000,
    // 5 Minutes
    5 * 60 * 1000,
    // 10 Minutes
    10 * 60 * 1000
]

## Functions

### `Const` createShouldStopFn

▸ **createShouldStopFn**(`stop`: [Stop](_retry_.md#stop)): *[StopFn](../interfaces/_retry_.stopfn.md)*

**Parameters:**

Name | Type |
------ | ------ |
`stop` | [Stop](_retry_.md#stop) |

**Returns:** *[StopFn](../interfaces/_retry_.stopfn.md)*

___

### `Const` createWaitAfterFn

▸ **createWaitAfterFn**(`times`: [WaitTimes](_retry_.md#waittimes)): *[WaitTimeFunction](../interfaces/_retry_.waittimefunction.md)*

**Parameters:**

Name | Type |
------ | ------ |
`times` | [WaitTimes](_retry_.md#waittimes) |

**Returns:** *[WaitTimeFunction](../interfaces/_retry_.waittimefunction.md)*

___

### `Const` retry

▸ **retry**(`fn`: [BaseFunction](../interfaces/_types_.basefunction.md), `waitTimes`: [WaitTimes](_retry_.md#waittimes), `stop`: [Stop](_retry_.md#stop)): *Promise‹any› & [Cancelable](../interfaces/_types_.cancelable.md)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`fn` | [BaseFunction](../interfaces/_types_.basefunction.md) | - |
`waitTimes` | [WaitTimes](_retry_.md#waittimes) |  defaultWaitTimes |
`stop` | [Stop](_retry_.md#stop) | 10 |

**Returns:** *Promise‹any› & [Cancelable](../interfaces/_types_.cancelable.md)*
