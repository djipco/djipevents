/**
 * The `EventEmitter` class provides methods to implement the _observable_ design pattern. It is an
 * abstract class meant to be extended on (or mixed in) to add methods such as `addListener()`,
 * `removeListener()`, `emit()`, etc.
 *
 * The methods of this class mostly match those of the
 * [Node.js EventEmitter API](https://nodejs.org/api/events.html#events_class_eventemitter) but they
 * are meant to be used in the browser.
 */
export default class EventEmitter {

  constructor() {
    this.events = {};
    this.eventsCount = 0;
  }

  /**
   * Adds a listener for a specific event.
   *
   * @param {string|Symbol} event The event to listen to
   * @param {function} callback The callback function (i.e. listener) to execute when the event
   * occurs
   * @param {*} [context=this] The context to invoke the callback function in.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   *
   * @returns {EventEmitter} The `EventEmitter` the method was invoked on (for method chaining).
   */
  addListener(event, callback, context, once = false) {

    if (typeof callback !== "function") throw new TypeError("The callback must be a function");

    let listener = new Listener(callback, context || this, once);

    if (!this.events[event]) {
      this.events[event] = listener;
      this.eventsCount++;
    } else if (!this.events[event].callback) {
      this.events[event].push(listener);
    } else {
      this.events[event] = [this.events[event], listener];
    }

    return this;

  }

  /**
   * Removes all listeners for a specific event.
   *
   * @param {String|Symbol} event The name of the event
   * @returns {EventEmitter} The `EventEmitter` the method was invoked on (for method chaining).
   */
  removeEvent(event) {

    if (--this.eventsCount === 0) {
      this.events = {};
    } else {
      delete this.events[event];
    }

    return this;

  }

  /**
   * Returns an array of all the unique events for which the emitter has registered listeners.
   * @returns {String[]}
   */
  eventNames() {

    let names = []
      , events
      , name;

    if (this.eventsCount === 0) return names;

    for (name in (events = this.events)) {
      if (Object.prototype.hasOwnProperty.call(events, name)) {
        names.push(name);
      }
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;

  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Listener[]} The registered listeners.
   */
  listeners(event) {

    let ee = [];
    let handlers = this.events[event];

    if (!handlers) return [];
    if (handlers.callback) return [handlers.callback];

    for (let i = 0; i < handlers.length; i++) {
      ee[i] = handlers[i].callback;
    }

    return ee;

  };

  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {String|Symbol} event The event name.
   * @returns {Number} The number of listeners.
   */
  listenerCount(event) {

    let listeners = this.events[event];

    if (!listeners) return 0;
    if (listeners.callback) return 1;
    return listeners.length;

  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   */
  emit(event, a1, a2, a3, a4, a5) {

    if (!this.events[event]) return false;

    let listeners = this.events[event]
      , len = arguments.length
      , args
      , i;

    if (listeners.callback) {

      if (listeners.once) this.removeListener(event, listeners.callback, undefined, true);

      switch (len) {
        case 1: return listeners.callback.call(listeners.context), true;
        case 2: return listeners.callback.call(listeners.context, a1), true;
        case 3: return listeners.callback.call(listeners.context, a1, a2), true;
        case 4: return listeners.callback.call(listeners.context, a1, a2, a3), true;
        case 5: return listeners.callback.call(listeners.context, a1, a2, a3, a4), true;
        case 6: return listeners.callback.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len -1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.callback.apply(listeners.context, args);

    } else {

      let length = listeners.length
        , j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].callback, undefined, true);

        switch (len) {
          case 1: listeners[i].callback.call(listeners[i].context); break;
          case 2: listeners[i].callback.call(listeners[i].context, a1); break;
          case 3: listeners[i].callback.call(listeners[i].context, a1, a2); break;
          case 4: listeners[i].callback.call(listeners[i].context, a1, a2, a3); break;
          default:
            if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

            listeners[i].callback.apply(listeners[i].context, args);
        }
      }

    }

    return true;

  };

  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} callback The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   *
   * @returns {EventEmitter} The `EventEmitter` the method was invoked on (for method chaining).
   */
  on(event, callback, context) {
    return this.addListener(event, callback, context, false);
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} callback The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   *
   * @returns {EventEmitter} The `EventEmitter` the method was invoked on (for method chaining).
   */
  once(event, callback, context) {
    return this.addListener(event, callback, context, true);
  };

  /**
   * Removes the listener(s) of a given event. If a callback function is provided, it will only
   * remove the listeners that match this function.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} [callback] Only remove the listeners that match this function.
   * @param {*} [context] Only remove the listeners that have this context.
   * @param {Boolean} [once=false] Only remove one-time listeners.
   *
   * @returns {EventEmitter} The `EventEmitter` the method was invoked on (for method chaining).
   */
  removeListener(event, callback, context, once) {

    let events = [];

    if (!this.events[event]) return this;
    if (!callback) {
      this.removeEvent(event);
      return this;
    }

    let listeners = this.events[event];

    if (listeners.callback) {
      if (
        listeners.callback === callback &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        this.removeEvent(event);
      }
    } else {
      for (let i = 0, events = [], length = listeners.length; i < length; i++) {
        if (
          listeners[i].callback !== callback ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      // Reset the array, or remove it completely if we have no more listeners.
      if (events.length) this.events[event] = events.length === 1 ? events[0] : events;
      else this.removeEvent(event);
    }

    return this;

  }

  /**
   * Removes the listener(s) of a given event. If a callback function is provided, it will only
   * remove the listeners that match this function.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} [callback] Only remove the listeners that match this function.
   * @param {*} [context] Only remove the listeners that have this context.
   * @param {Boolean} [once=false] Only remove one-time listeners.
   *
   * @returns {EventEmitter} The `EventEmitter` the method was invoked on (for method chaining).
   */
  off(event, callback, context, once) {
    return this.removeListener(event, callback, context, once);
  }

  /**
   * Remove all listeners, or those for the specified event (if present).
   *
   * @param {(String|Symbol)} [event] The event name.
   *
   * @returns {EventEmitter} The `EventEmitter` the method was invoked on (for method chaining).
   */
  removeAllListeners(event) {

    if (event) {
      if (this.events[event]) this.removeEvent(event);
    } else {
      this.events = {};
      this.eventsCount = 0;
    }

    return this;

  }

}

/**
 * The `Listener` class represents a single event listener object. Such objects store the callback
 * (listener) function, the context to execute the function in (often `this`) and whether or not the
 * callback should only be executed once.
 */
export class Listener {

  /**
   * @param {Function} callback The listener function
   * @param {*} [context] The context to invoke the listener in
   * @param {Boolean} [once=false] Whether the callback function should be executed only once
   */
  constructor(callback, context, once = false) {
    this.callback = callback;
    this.context = context;
    this.once = once === true || false;
  }

}
