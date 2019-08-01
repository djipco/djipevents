# DjipEvents

DjipEvents is an event-handling library that can be used in the browser and in 
[Node.js](https://nodejs.org). It features methods to register, trigger and delete events. It is a 
mostly abstract class meant to be extended by (or mixed into) other objects. 
 
It is currently available in 3 flavors:

  * **CommonJS**: ES5 syntax for Node.js
  * **ESM**: ES6 module syntax for modern browsers
  * **IIFE**: ES5 syntax for legacy browser support (via `<script>` tag)

This library is being primarily used in my own projects ([DjipAV](https://github.com/djipco/djipav), 
for example) and I do not necessarily intend on providing support for it. However, if you feel like 
using it, go right ahead!

## Importing into project

### ES6 module syntax

This is for use in modern browsers that support the ECMAScript 6 syntax for module imports and 
exports:

```javascript
import {EventEmitter} from "node_modules/djipevents/dist/djipevents.esm.min.js";
```
Note that the library (purposely) does not provide a default export. This means you have to use 
curly quotes when importing.

### Object in global namespace (djipevents)

This is mostly for legacy-browser support. It might be easier for some as it is a very common 
approach:

```html
<script src="node_modules/djipevents/dist/djipevents.iife.min.js"></script>
```

You can also use the CDN version:

```html
<script src="https://cdn.jsdelivr.net/npm/djipevents/dist/djipevents.iife.min.js"></script>

```
Beware that, in production, you should probably target a specific version of the library:

```html
<script src="https://cdn.jsdelivr.net/npm/djipevents@0.9.4/dist/djipevents.iife.min.js"></script>

```

### CommonJS format (Node.js)

CommonJS is the standard in the Node.js world. Even though Node.js already offers its own 
`EventEmitter` object, you can still use this **djipevents** if you prefer: 

```javascript
const EventEmitter = require("djipevents").EventEmitter;
```

## Key features

This library is nothing extraordinary but it does have some interesting features not necessarily 
found in the browser's `EventTarget` or in Node.js' `EventEmitter`:

  * Listeners can be set to trigger an arbitrary number of times with the `count` option;
  * Listeners can be set to expire with the `duration` option;
  * The `emit()` method returns an array containing the return value of all callback functions;
  * A custom value for `this` in the callback can be assigned via the `context` option;
  * It is possible to listen to all events by using `EventEmitter.ANY_EVENT`.
  * You can pass data to the callback by using the `data` option of `addListener()`. You can also 
  pass data to the callback by using the second parameter of the `emit()` method.
  * The `Listener` object returned by `addListener()` has a `remove()` method that allows you to 
  easily remove the listener.
  
### Hidden goodies
  
As you can see in the reference, the [API](https://djipco.github.io/djipevents/EventEmitter.html) is 
quite lean. It is meant to be that way. That does not mean the library is less powerful than others. 
Some of the functionalities are just less glaringly obvious than with some other libraries. For 
example:

  * While **djipevents** does not have a `removeAllEventListeners()` method, you can achieve the 
  same by calling `removeListener()` with no arguments.
  
  * There is no `once()` method. Just use the `addListener()` method with the `remaining` option.

  * There is no `prependListener()` method. Just use `addListener()` with the `prepend` option.

There are no `on()` and `off()` methods either. You might be wondering why. To me, `on()`, `off()` 
and `once()` only look good for a brief moment. Once you start extending or mixing in this library, 
you realize that identifiers such as `on` and `off` are collide-prone and do not really describe 
what the library is doing.

## API Reference

This library is quite straightforward and I did not take time to create usage examples. However, I 
did take some time to create a complete 
**[API Reference](https://djipco.github.io/djipevents/EventEmitter.html)** which should be enough 
for most to get started.
