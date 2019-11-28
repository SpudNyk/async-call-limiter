## Functions

<dl>
<dt><a href="#callReduce">callReduce(fn, callReducer, onBeforeReduce, onAfterReduce)</a> ⇒ <code><a href="#debounced">debounced</a></code></dt>
<dd><p>Utility function that wraps a function and will use a reducer to combine the arguments
of multiple calls to that function. As the function is not executed until it is invoked
a promise for the result is returned to the callers.</p>
</dd>
<dt><a href="#cancelable">cancelable(promise, [canceller])</a> ⇒ <code>Promise</code></dt>
<dd><p>Wraps a promise that can be cancelled by calling it&#39;s cancel function
If the promise settles then call
Cancelling a promise causes it to reject with the given reason or Cancelled</p>
</dd>
<dt><a href="#debounce">debounce(fn, delay, argumentsReducer, maxDelay, cancelFn)</a> ⇒ <code><a href="#debounced">debounced</a></code></dt>
<dd><p>Ensure multiple calls to a function will only execute it once no more calls have happend for <code>delay</code> milliseconds.
The result of the call will be returned as a promise to the caller.</p>
</dd>
<dt><a href="#delay">delay(value, wait)</a> ⇒ <code>Promise</code></dt>
<dd><p>Promises a given value/or function call result after a given wait</p>
</dd>
<dt><a href="#latestArgumentsReducer">latestArgumentsReducer(current, next)</a> ⇒ <code>Array</code></dt>
<dd><p>An <a href="argumentsReducer">argumentsReducer</a> that always uses the latest given arguments</p>
</dd>
<dt><a href="#throttle">throttle(fn, delay, argumentsReducer, onCancel)</a> ⇒ <code><a href="#throttled">throttled</a></code></dt>
<dd><p>Ensure multiple calls to a function will only execute it at most once every <code>delay</code> milliseconds.
The result of the call will be returned as a promise to the caller.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#debounced">debounced</a> ⇒ <code>Promise</code></dt>
<dd><p>A debounced function</p>
</dd>
<dt><a href="#throttled">throttled</a> ⇒ <code>Promise</code></dt>
<dd><p>A throttled function</p>
</dd>
</dl>

<a name="callReduce"></a>

## callReduce(fn, callReducer, onBeforeReduce, onAfterReduce) ⇒ [<code>debounced</code>](#debounced)
Utility function that wraps a function and will use a reducer to combine the arguments
of multiple calls to that function. As the function is not executed until it is invoked
a promise for the result is returned to the callers.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | The function to wrap. |
| callReducer | <code>argumentsReducer</code> | Used to determine the arguments when `fn` is invoked. This will be called every time the wrapped function is called. If not supplied the default implementation of only using the latest arguments will be used. |
| onBeforeReduce | <code>function</code> | If supplied this function will be called before the reducer is called. |
| onAfterReduce | <code>function</code> | If supplied this function will be called if the wrapped function is cancelled. |

<a name="cancelable"></a>

## cancelable(promise, [canceller]) ⇒ <code>Promise</code>
Wraps a promise that can be cancelled by calling it's cancel function
If the promise settles then call
Cancelling a promise causes it to reject with the given reason or Cancelled

**Kind**: global function  
**Returns**: <code>Promise</code> - A cancellable promise.  

| Param | Type | Description |
| --- | --- | --- |
| promise | <code>Promise</code> | The promise to wrap. |
| [canceller] | <code>canceller</code> | A function to call that will cause the wrapped promise to reject. This can be used to abort transactions etc. |

<a name="debounce"></a>

## debounce(fn, delay, argumentsReducer, maxDelay, cancelFn) ⇒ [<code>debounced</code>](#debounced)
Ensure multiple calls to a function will only execute it once no more calls have happend for `delay` milliseconds.
The result of the call will be returned as a promise to the caller.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | The function to debounce |
| delay | <code>number</code> | <code>50</code> | The number of milliseconds on inactivity before the function will be called. |
| argumentsReducer | <code>argumentsReducer</code> |  | Used to determine the arguments when `fn` is invoked. This will be called every time the debounced function is called. If not supplied the default implementation of only using the latest arguments will be used. |
| maxDelay | <code>number</code> | <code>0</code> | The maximum number of milliseconds before the function will be called. If this is not 0 then the function will be called after the elapsed time. |
| cancelFn | <code>function</code> |  | If supplied this function will be called if the debounced function is cancelled. |

<a name="delay"></a>

## delay(value, wait) ⇒ <code>Promise</code>
Promises a given value/or function call result after a given wait

**Kind**: global function  
**Returns**: <code>Promise</code> - A promise that resolves with the value/function result.
The promise also has a `cancel` function to allow canceling the result.
This can be called before the wait is over to reject the promise and not
execute any pending functions.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> \| <code>function</code> | The value or function to return after the delay. If a function is supplied it is executed after the wait and it's result is returned. |
| wait | <code>number</code> | The wait time before the value is returned. |

<a name="latestArgumentsReducer"></a>

## latestArgumentsReducer(current, next) ⇒ <code>Array</code>
An [argumentsReducer](argumentsReducer) that always uses the latest given arguments

**Kind**: global function  
**Returns**: <code>Array</code> - The new arguments  

| Param | Type | Description |
| --- | --- | --- |
| current | <code>Array</code> | The current arguments |
| next | <code>Array</code> | The next arguments |

<a name="throttle"></a>

## throttle(fn, delay, argumentsReducer, onCancel) ⇒ [<code>throttled</code>](#throttled)
Ensure multiple calls to a function will only execute it at most once every `delay` milliseconds.
The result of the call will be returned as a promise to the caller.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | The function to throttle |
| delay | <code>number</code> | <code>50</code> | The number of milliseconds between functions. |
| argumentsReducer | <code>argumentsReducer</code> |  | Used to determine the arguments when `fn` is invoked. This will be called every time the throttled function is called. If not supplied the default implementation of only using the latest arguments will be used. |
| onCancel | <code>function</code> | <code></code> | If supplied this function will be called if the throttled function is cancelled. |

<a name="debounced"></a>

## debounced ⇒ <code>Promise</code>
A debounced function

**Kind**: global typedef  
**Returns**: <code>Promise</code> - A promise that will resolve with the result of the function.  

| Param | Type | Description |
| --- | --- | --- |
| ...arguments | <code>\*</code> | The arguments to the function. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cancel | <code>function</code> | Call to cancel pending calls. |

<a name="throttled"></a>

## throttled ⇒ <code>Promise</code>
A throttled function

**Kind**: global typedef  
**Returns**: <code>Promise</code> - A promise that will resolve with the result of the function.  

| Param | Type | Description |
| --- | --- | --- |
| ...arguments | <code>\*</code> | The arguments to the function. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cancel | <code>function</code> | Call to cancel pending calls. |

