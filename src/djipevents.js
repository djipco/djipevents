/**
 * The `EventEmitter` class provides methods to implement the _observable_ design pattern. This
 * pattern allows one to _register_ a function to execute when a specific event is triggered by the
 * emitter.
 *
 * It is a mostly abstract class meant to be extended by (or mixed into) other objects.
 */
export class EventEmitter {

  constructor() {

    /**
     * Object containing a named property for all the events with at least one registered listener
     * @type {Object}
     * @readonly
     */
    this.events = {};

    /**
     * Whether or not the execution of function callbacks is currently suspended for this whole
     * emitter
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
   * @param {Object} [options={}]
   * @param {Object} [options.context=this] The context to invoke the callback function in.
   * @param {boolean} [options.times=Infinity] The number of times after which the callback should
   * automatically be removed.
   * @param {*} [options.data] Arbitrary data to pass on to the callback function upon execution
   *
   * @returns {Listener}
   */
  on(event, callback, options = {}) {

    if (typeof callback !== "function") throw new TypeError("The callback must be a function");

    // Define default options and merge declared options into them
    const defaults = {
      context: this,
      times: Infinity,
      data: undefined
    };
    options = Object.assign({}, defaults, options);

    const listener = new Listener(event, this, callback, options);

    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);

    return listener;

  }

  /**
   * Returns `true` if the specified event has at least one registered listener
   *
   * @param {string} The event name
   * @returns {boolean}
   */
  hasListener(event) {
    return (this.events[event] && this.events[event].length > 0) ? true : false;
  }

  /**
   * An array of all the unique event names for which the emitter has at least one registered
   * listener.
   *
   * @type {string[]}
   * @readonly
   */
  get eventNames() {
    return Object.keys(this.events);
  }

  /**
   * Returns an array of all the `Listener` objects registered for a specific event.
   *
   * @param {string} event The event name.
   * @returns {Listener[]} An array of `Listener` objects
   */
  getListeners(event) {
    return this.events[event] || [];
  }

  /**
   * Suspends execution of all callbacks for the specified event type
   *
   * @param {string} event The event to suspend
   */
  suspend(event) {
    this.getListeners(event).forEach(listener => {
      listener.suspended = true;
    });
  }

  /**
   * Resumes execution of all callbacks for the specified event type
   * @param {string} event
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
   * If the `suspended` property of the `EventEmitter` or of the `Listener` is `true`, the callback
   * functions will not be executed.
   *
   * @param {String} event The event name.
   */
  emit(event, value) {

    // This is the global suspension check
    if (!this.events[event]|| this.suspended) return;

    this.events[event].forEach(listener => {

      // This is the per-listener suspension check
      if (listener.suspended) return;

      if (listener.times > 0) {

        if (value !== undefined) {
          listener.callback.call(listener.context, value, listener.data);
        } else {
          listener.callback.call(listener.context, listener.data);
        }

      }

      if (--listener.times < 1) listener.remove();

    });

  }

  /**
   * Add a one-time listener for a specific event. It returns the `Listener` that was created and
   * attached to the event.
   *
   * @param {string} event The event to listen to
   * @param {Function} callback The callback function to execute when the event occurs
   * @param {Object} [options={}]
   * @param {Object} [options.context=this] The context to invoke the callback function in (a.k.a.
   * the value of `this`).
   * @param {*} [options.data] Arbitrary data to pass on to the callback function upon execution (as
   * the second parameter)
   *
   * @returns {Listener}
   */
  once(event, callback, options = {}) {
    options.times = 1;
    return this.on(event, callback, options);
  }

  /**
   * Removes all the listeners that match the specified type of event and, optionnally, the
   * specified callback and the other options.
   *
   * @param {string} event The event name.
   * @param {Function} [callback] Only remove the listeners that match this exact callback function.
   * @param {*} [context] Only remove the listeners that have this exact context.
   * @param {number} [times] Only remove the listener if it has exactly that many remaining times to
   * be executed.
   */
  off(event, callback, options = {}) {

    if (!this.events[event]) return;

    // Find listeners that do not match the criterias (those are the ones we will keep)
    let events = this.events[event].filter(listener => {
      return (callback && listener.callback !== callback) ||
        (options.times && options.times !== listener.times) ||
        (options.context && options.context !== listener.context);
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
   *
   * @type {number}
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
   * @param {string} event The name of the event being listened to
   * @param {EventEmitter} target The `EventEmitter` object that the listener is attached to
   * @param {Function} callback The function to call when the listener is triggered
   * @param {Object} [options={}]
   * @param {Object} [options.context=this] The context to invoke the listener in (a.k.a. the value
   * of `this` inside the callback function.
   * @param {number} [options.times=Infinity] The remaining number of times after which the
   * callback should automatically be removed.
   * @param {*} [options.data={}] Arbitrary data to pass along to the callback function upon
   * execution (as the second parameter)
   */
  constructor(event, target, callback, options = {}) {

    // Define default options and merge declared options into them,
    const defaults = {
      context: this,
      times: Infinity,
      data: undefined
    };
    options = Object.assign({}, defaults, options);

    /**
     * The event name
     * @type {string}
     */
    this.event = event;

    /**
     * The object that the event is attached to (or that emitted the event)
     * @type {EventEmitter}
     */
    this.target = target;

    /**
     * The callback function
     * @type {Function}
     */
    this.callback = callback;

    /**
     * The context to execute the context function in (a.k.a. the value of `this` inside the
     * callback function)
     * @type {Object}
     */
    this.context = options.context;

    /**
     * The remaining number of times after which the callback should automatically be removed.
     * @type {number}
     */
    this.times = options.times;

    /**
     * Arbitraty data that is going to be passed as the second parameter of the callback function
     * @type {*}
     */
    this.data = options.data;

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
    this.target.off(this.event, this.callback, {context: this.context, times: this.times});
  }

}
