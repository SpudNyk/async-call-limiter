[async-call-limiter](../README.md) › ["pending"](../modules/_pending_.md) › [Pending](_pending_.pending.md)

# Interface: Pending <**T**>

Used to hold a pending result

## Type parameters

▪ **T**

## Hierarchy

* **Pending**

## Index

### Properties

* [promise](_pending_.pending.md#promise)

### Methods

* [complete](_pending_.pending.md#complete)
* [error](_pending_.pending.md#error)

## Properties

###  promise

• **promise**: *Promise‹T›*

*Defined in [pending.ts:12](https://github.com/SpudNyk/async-call-limiter/blob/a5b269b/src/pending.ts#L12)*

Holds the promise that will resolve with the result value.

## Methods

###  complete

▸ **complete**(`result`: T): *Promise‹T›*

*Defined in [pending.ts:22](https://github.com/SpudNyk/async-call-limiter/blob/a5b269b/src/pending.ts#L22)*

complete the result

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`result` | T | the final result  |

**Returns:** *Promise‹T›*

___

###  error

▸ **error**(`err?`: any): *Promise‹T›*

*Defined in [pending.ts:17](https://github.com/SpudNyk/async-call-limiter/blob/a5b269b/src/pending.ts#L17)*

Indicate an error occurred

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`err?` | any |   |

**Returns:** *Promise‹T›*
