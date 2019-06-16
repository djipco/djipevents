# DjipEvents

DjipEvents is an event-handling library that can be used in the browser and in Node.js. It features
methods to register, trigger and delete events. It is a mostly abstract class meant to be extended 
by (or mixed into) other objects. 
 
It is currently available in 3 flavors:

  * **CommonJS**: ES5 syntax for Node.js
  * **ESM**: ES6 module syntax for modern browsers
  * **IIFE**: ES5 syntax for legacy browser support (via `<script>` tag)

This library is being primarily used in my own projects ([DjipAV](https://github.com/djipco/djipav), 
for example) and I do not necessarily intend on providing support for it. However, if you feel like 
using it, go right ahead!

## Importing into project

ES6 module in browser:

```javascript
import EventEmitter from "node_modules/djipevents/dist/djipevents.esm.min.js";
```

Global in browser:

```html
<script src="node_modules/djipevents/dist/djipevents.iife.min.js">
```

Node.js:

```javascript
const EventEmitter = require('djipevents');
```

## API Reference

This library is quite straightforward and I did not take time to create usage examples. However, I 
did take some time to create a complete [API Reference](https://djipco.github.io/djipevents/) which
should be enough for most to get started.
