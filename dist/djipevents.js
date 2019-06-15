/**
 * The `EventEmitter` class provides methods to implement the _observable_ design pattern. It is an
 * abstract class meant to be extended on (or mixed in) to add methods such as `on()`, `off()`,
 * `emit()`, etc.
 */
export default class EventEmitter {

  constructor() {

    /**
     * Object containing properties for all events with registered listeners
     * @type {{}}
     * @readonly
     */
    this.events = {};

    /**
     * Whether the execution of callbacks is currently suspended or not
     * @type {boolean}
     */
    this.suspended = false;

  }

  /**
   * Adds a listener for a specific event. It returns the `Listener` that was created and attached
   * to the event.
   *
   * @param {String} event The event to listen to
   * @param {Function} callback The callback function to execute when the event occurs
   * @param {Object} [context] The context to invoke the callback function in.
   * @param {Boolean} [once=false] Whether the listener should only be executed once
   * @param {{}} [data] Arbitrary data to pass on to the callback function upon execution
   *
   * @returns {Listener}
   */
  on(event, callback, context, once, data) {

    if (typeof callback !== "function") throw new TypeError("The callback must be a function");

    let listener = new Listener(event, this, callback, context, once, data);

    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);

    return listener;

  }

  /**
   * Returns `true` if the specified event has at least one listener
   * @param {string} The event name
   * @returns {boolean}
   */
  hasListener(event) {

    if (this.events[event] && this.events[event].length > 0) {
      return true;
    } else {
      return false;
    }

  }

  /**
   * An array of all the unique event names for which the emitter has registered listeners.
   * @type {String[]}
   * @readonly
   */
  get eventNames() {
    return Object.keys(this.events);
  }

  /**
   * Returns all the `Listener` objects registered for a specific event.
   *
   * @param {(String)} event The event name.
   * @returns {Listener[]} An array of `Listener` objects
   */
  getListeners(event) {
    return this.events[event] || [];
  }

  /**
   * Suspends execution of callbacks for the specified event type
   * @param event
   */
  suspend(event) {
    this.getListeners(event).forEach(listener => {
      listener.suspended = true;
    });
  }

  /**
   * Resumes execution of callbacks for the specified event type
   * @param event
   */
  unsuspend(event) {
    this.getListeners(event).forEach(listener => {
      listener.suspended = false;
    });
  }

  /**
   * Returns the number of listeners registered for a given event.
   *
   * @param {String} event The event name.
   * @returns {Number} The number of listeners registered for the specified event.
   */
  getListenerCount(event) {
    return this.getListeners(event).length;
  }

  /**
   * Executes the callback functions of all `Listener` objects registered for a given event. The
   * functions are passed the specifid `value` (if present) and the content of the listener's
   * `data` property (if any).
   *
   * If `suspended` is `true` no callback functions will be executed.
   *
   * @param {String} event The event name.
   */
  emit(event, value) {

    if (!this.events[event]|| this.suspended) return;

    this.events[event].forEach(listener => {

      if (listener.suspended) return;

      if (value !== undefined) {
        listener.callback.call(listener.context, value, listener.data);
      } else {
        listener.callback.call(listener.context, listener.data);
      }

      if (listener.once) listener.remove();

    });

  }

  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String)} event The event name.
   * @param {Function} callback The listener function.
   * @param {*} [context] The context to invoke the listener with.
   * @param {*} [data] Arbitrary data to pass along to the callback function upon execution
   *
   * @returns {Listener}
   */
  once(event, callback, context, data) {
    return this.on(event, callback, context, true, data);
  }

  /**
   * Removes all the listeners that match the specified type of event and, if specified, other
   * criterias.
   *
   * @param {String} event The event name.
   * @param {Function} [callback] Only remove the listeners that match this function.
   * @param {*} [context] Only remove the listeners that have this context.
   * @param {Boolean} [once=false] Only remove one-time listeners.
   */
  off(event, callback, context, once) {

    if (!this.events[event]) return;

    // Find listeners that do not match the criterias (those are the ones we will keep)
    let events = this.events[event].filter(listener => {
      return (callback && listener.callback !== callback) ||
        (once && !listener.once) ||
        (context && context !== listener.context);
    });

    if (events.length) {
      this.events[event] = events;
    } else {
      delete this.events[event];
    }

  }

  /**
   * Removes all listeners
   */
  removeAllListeners() {
    this.events = {};
  }

  /**
   * The number of unique events that have registered listeners
   * @type {Number}
   * @readonly
   */
  get eventCount() {
    return Object.keys(this.events).length;
  }

}

/**
 * The `Listener` class represents a single event listener object. Such objects keep all relevant
 * contextual information such as the event being listened to, the object the listener was attached
 * to, the callback function and so on.
 */
export class Listener {

  /**
   * @param {String} event The name of the event being listened to
   * @param {EventEmitter} target The object the listener was attached to
   * @param {Function} callback The actual listener function
   * @param {Object} [context] The context to invoke the listener in
   * @param {Boolean} [once=false] Whether the callback function should be executed only once
   * @param {Boolean} [data={}] Arbitrary data to pass along to the callback function upon
   * execution (as a second parameter)
   */
  constructor(event, target, callback, context, once, data) {

    /**
     * The event name
     * @type {String}
     */
    this.event = event;

    /**
     * The object that emitted the event
     * @type {EventEmitter}
     */
    this.target = target;

    /**
     * The callback function
     * @type {Function}
     */
    this.callback = callback;

    /**
     * The context to execute the context function in (a.k.a. the value of `this`)
     * @type {Object}
     */
    this.context = context;

    /**
     * Whether this listener's callback function should only be executed once
     * @type {boolean}
     */
    this.once = once == true || false;

    /**
     * Arbitraty data that is going to be passed as the second parameter of the callback function
     * @type {Boolean}
     */
    this.data = data;

    /**
     * Whether this listener is currently suspended
     * @type {boolean}
     */
    this.suspended = false;

  }

  /**
   * Removes the listener from its target.
   */
  remove() {
    this.target.off(this.event, this.callback, this.context, this.once);
  }

}
