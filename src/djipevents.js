/**
 * The `EventEmitter` class provides methods to implement the _observable_ design pattern. This
 * pattern allows one to _register_ a function to execute when a specific event is triggered by the
 * emitter.
 *
 * It is a mostly abstract class meant to be extended by (or mixed into) other objects.
 */
export class EventEmitter {

  /**
   * @param {boolean} [suspended=false] Whether the `EventEmitter` is initially in a suspended
   * state (i.e. not executing callbacks).
   */
  constructor(suspended = false) {

    /**
     * An object containing a property for each event with at least one registered listener. Each
     * event property contains an array of all the `Listener` objects registered for the event.
     *
     * @type {Object}
     * @readonly
     */
    this.map = {};

    /**
     * Whether or not the execution of function callbacks is currently suspended for this whole
     * emitter
     * @type {boolean}
     */
    this.suspended = suspended == true ? true : false;

  }

  /**
   * The callback function receives 0, 1 or 2 parameters depending on circumstances. If no specific
   * value is passed to `emit()`, the callback is executed without any parameters. If `emit()` is
   * called with a specific value, this value is passed along to the callback function(s). If the
   * `data` option was specified when the listener was added, this `data` will be passed along to
   * the callback function(s). This allows us to easily pass data from where the listener is added
   * to where it is executed.
   *
   * The value of `this` in the callback function(s) is set to the `context` option passed to the
   * `addListener()` method (if specified). By using the `context` option, it is no longer
   * necessary to explicitely bind the function.
   *
   * @callback EventEmitter~callback
   * @param {*} [value] The value passed to `emit()`
   * @param {*} [data] The data passed in the `options` when the listener was added
   */

  /**
   * Adds a listener for the specified event. It returns the `Listener` object that was created and
   * attached to the event.
   *
   * To attach a global listener that will be triggered for any events, use `EventEmitter.ANY_EVENT`
   * as the first parameter. Note that a global listener will also be triggered by non-registered
   * events. For example, this will trigger global listeners: `myEmitter.emit('bogus')`.
   *
   * Note that, while it is also possible to use the `on()` method to achieve the exact same result,
   * using `addListener()` is the recommended way.
   *
   * @param {string|EventEmitter.ANY_EVENT} event The event to listen to
   * @param {EventEmitter~callback} callback The callback function to execute when the event occurs
   * @param {Object} [options={}]
   * @param {Object} [options.context=this] The context to invoke the callback function in.
   * @param {boolean} [options.prepend=false] Whether the listener should be added at the beginning
   * of the listeners array
   * @param {number} [options.duration=Infinity] The number of milliseconds before the listener
   * automatically expires.
   * @param {boolean} [options.remaining=Infinity] The number of times after which the callback
   * should automatically be removed.
   * @param {*} [options.data] Arbitrary data to pass on to the callback function upon execution
   *
   * @returns {Listener} The newly created `Listener` object.
   *
   * @throws {TypeError} The `event` parameter must be a string or `EventEmitter.ANY_EVENT`.
   * @throws {TypeError} The `callback` parameter must be a function.
   */
  addListener(event, callback, options = {}) {

    if (
      typeof event !== "string" &&
      !(event instanceof String) &&
      event !== EventEmitter.ANY_EVENT
    ) {
      throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");
    }

    if (typeof callback !== "function") throw new TypeError("The callback must be a function.");

    // Define default options and merge declared options into them
    const defaults = {
      context: this,
      remaining: Infinity,
      data: undefined,
      duration: Infinity,
      prepend: false
    };
    options = Object.assign({}, defaults, options);

    const listener = new Listener(event, this, callback, options);

    // Make sure it is eventually deleted if a duration is supplied
    if (options.duration !== Infinity) {
      setTimeout(() => listener.remove(), options.duration);
    }

    if (!this.map[event]) this.map[event] = [];

    if (options.prepend) {
      this.map[event].unshift(listener);
    } else {
      this.map[event].push(listener);
    }

    return listener;

  }

  /**
   * @private
   * @deprecated
   */
  on(event, callback, options = {}) {
    return this.addListener(event, callback, options);
  }

  /**
   * @private
   * @deprecated
   */
  once(event, callback, options = {}) {
    options.remaining = 1;
    return this.addListener(event, callback, options);
  }

  /**
   * Identifier to use when trying to add or remove a listener that should be triggered when any
   * events occur.
   *
   * @type {Symbol}
   */
  static get ANY_EVENT() {
    return Symbol.for("Any event");
  }

  /**
   * Returns `true` if the specified event has at least one registered listener.
   *
   * Note: to check for global listeners added with `EventEmitter.ANY_EVENT`, use
   * `EventEmitter.ANY_EVENT` as the parameter.
   *
   * @param {string|EventEmitter.ANY_EVENT} event The event to check
   * @returns {boolean}
   */
  hasListener(event) {
    return (this.map[event] && this.map[event].length > 0) ? true : false;
  }

  /**
   * An array of all the unique event names for which the emitter has at least one registered
   * listener.
   *
   * Note: this excludes global events registered with `EventEmitter.ANY_EVENT` because they are not
   * tied to a specific event.
   *
   * @type {string[]}
   * @readonly
   */
  get eventNames() {
    return Object.keys(this.map);
  }

  /**
   * Returns an array of all the `Listener` objects that will be triggered for a specific event.
   *
   * Please note that global events (those added with `EventEmitter.ANY_EVENT`) are not returned for
   * "regular" events. To get the list of global listeners, specifically use
   * `EventEmitter.ANY_EVENT` as the parameter.
   *
   * @param {string|EventEmitter.ANY_EVENT} event The event to get listeners for
   * @returns {Listener[]} An array of `Listener` objects
   */
  getListeners(event) {
    return this.map[event] || [];
  }

  /**
   * Suspends execution of all callbacks functions registered for the specified event type.
   *
   * You can suspend execution of callbacks registered with `EventEmitter.ANY_EVENT` by passing
   * `EventEmitter.ANY_EVENT` to `suspend()`. Beware that this will not suspend all callbacks but
   * only those registered with `EventEmitter.ANY_EVENT`. While this may seem counter-intuitive at
   * first glance, it allows the selective suspension of global listeners while leaving other
   * liseners alone. If you truly want to suspends all callbacks for a specific `EventEmitter`,
   * simply set its `suspended` property to `true`.
   *
   * @param {string|EventEmitter.ANY_EVENT} event The event for which to suspend execution of all
   * callback functions.
   */
  suspend(event) {
    this.getListeners(event).forEach(listener => {
      listener.suspended = true;
    });
  }

  /**
   * Resumes execution of all suspended callback functions registered for the specified event type.
   *
   * You can resume execution of callbacks registered with `EventEmitter.ANY_EVENT` by passing
   * `EventEmitter.ANY_EVENT` to `unsuspend()`. Beware that this will not resume all callbacks but
   * only those registered with `EventEmitter.ANY_EVENT`. While this may seem counter-intuitive, it
   * allows the selective unsuspension of global listeners while leaving other callbacks alone.
   *
   * @param {string|EventEmitter.ANY_EVENT} event The event for which to resume execution of all
   * callback functions.
   */
  unsuspend(event) {
    this.getListeners(event).forEach(listener => {
      listener.suspended = false;
    });
  }

  /**
   * Returns the number of listeners registered for a specific event.
   *
   * Please note that global events (those added with `EventEmitter.ANY_EVENT`) do not count
   * towards the remaining number for a "regular" event. To get the number of global listeners,
   * specifically use `EventEmitter.ANY_EVENT` as the parameter.
   *
   * @param {string|EventEmitter.ANY_EVENT} event The event
   * @returns {number} The number of listeners registered for the specified event.
   */
  getListenerCount(event) {
    return this.getListeners(event).length;
  }

  /**
   * Executes the callback functions of all `Listener` objects registered for a given event. The
   * functions are passed the specified `value` (if present) as the first parameter and the content
   * of the listener's `data` property (if any).
   *
   * If the `suspended` property of the `EventEmitter` or of the `Listener` is `true`, the callback
   * functions will not be executed.
   *
   * This function returns an array containing the return values of each of the callbacks.
   *
   * It should be noted that the regular listeners are triggered first followed by the global
   * listeners (added with `EventEmitter.ANY_EVENT`).
   *
   * @param {string} event The event
   * @param {*} value Arbitrary data to pass along to the callback functions
   *
   * @returns {Array} An array containing the return value of each of the executed listener
   * functions
   *
   * @throws {TypeError} The `event` parameter must be a string.
   */
  emit(event, value) {

    if (typeof event !== "string" && !(event instanceof String)) {
      throw new TypeError("The 'event' parameter must be a string.");
    }

    if (this.suspended) return;

    // We collect return values for all listeners here
    let results = [];

    // We must make sure that we do not have undefined otherwise concat() will add an undefined
    // entry in the array.
    let listeners = this.map[EventEmitter.ANY_EVENT] || [];

    if (this.map[event]) listeners = listeners.concat(this.map[event]);

    listeners.forEach(listener => {

      // This is the per-listener suspension check
      if (listener.suspended) return;

      if (listener.remaining > 0) {

        if (value !== undefined) {
          results.push(
            listener.callback.call(listener.context, value, listener.data)
          );
        } else {
          results.push(
            listener.callback.call(listener.context, listener.data)
          );
        }

        listener.count++;

      }

      if (--listener.remaining < 1) listener.remove();

    });

    return results;

  }

  /**
   * Removes all the listeners that match the specified criterias. If no parameters are passed, all
   * listeners will be removed. If only the `event` parameter is passed, all listeners for that
   * event will be removed. You can remove global listeners by using `EventEmitter.ANY_EVENT` as the
   * first parameter.
   *
   * To use more granular options, you must at least define the `event`. Then, you can specify the
   * callback to match or one or more of the additional options.
   *
   * Note that, while it is also possible to use the `off()` method to achieve the exact same
   * result, using `removeListener()` is the recommended way.
   *
   * @param {string} [event] The event name.
   * @param {EventEmitter~callback} [callback] Only remove the listeners that match this exact
   * callback function.
   * @param {Object} [options={}]
   * @param {*} [options.context] Only remove the listeners that have this exact context.
   * @param {number} [options.remaining] Only remove the listener if it has exactly that many
   * remaining times to be executed.
   */
  removeListener(event, callback, options = {}) {

    // Remove all listeners
    if (!event) {
      this.map = {};
      return;
    }

    if (!this.map[event]) return;

    // Find listeners that do not match the criterias (those are the ones we will keep)
    let events = this.map[event].filter(listener => {
      return (callback && listener.callback !== callback) ||
        (options.remaining && options.remaining !== listener.remaining) ||
        (options.context && options.context !== listener.context);
    });

    if (events.length) {
      this.map[event] = events;
    } else {
      delete this.map[event];
    }

  }

  /**
   * @private
   * @deprecated
   */
  off(event, callback, options = {}) {
    return this.removeListener(event, callback, options);
  }

  /**
   * The number of unique events that have registered listeners
   *
   * Note: this excludes global events registered with `EventEmitter.ANY_EVENT` because they are not
   * tied to a specific event.
   *
   * @type {number}
   * @readonly
   */
  get eventCount() {
    return Object.keys(this.map).length;
  }

}

/**
 * The `Listener` class represents a single event listener object. Such objects keep all relevant
 * contextual information such as the event being listened to, the object the listener was attached
 * to, the callback function and so on.
 */
export class Listener {

  /**
   * @param {string|EventEmitter.ANY_EVENT} event The event being listened to
   * @param {EventEmitter} target The `EventEmitter` object that the listener is attached to
   * @param {EventEmitter~callback} callback The function to call when the listener is triggered
   * @param {Object} [options={}]
   * @param {Object} [options.context=this] The context to invoke the listener in (a.k.a. the value
   * of `this` inside the callback function.
   * @param {number} [options.remaining=Infinity] The remaining number of times after which the
   * callback should automatically be removed.
   * @param {*} [options.data={}] Arbitrary data to pass along to the callback function upon
   * execution (as the second parameter)
   *
   * @throws {TypeError} The `event` parameter must be a string or `EventEmitter.ANY_EVENT`.
   * @throws {ReferenceError} The `target` parameter is mandatory.
   * @throws {TypeError} The `callback` must be a function.
   */
  constructor(event, target, callback, options = {}) {

    if (
      typeof event !== "string" &&
      !(event instanceof String) &&
      event !== EventEmitter.ANY_EVENT
    ) {
      throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");
    }

    if (!target) {
      throw new ReferenceError("The 'target' parameter is mandatory.");
    }

    if (typeof callback !== "function") {
      throw new TypeError("The 'callback' must be a function.");
    }

    // Define default options and merge declared options into them,
    const defaults = {
      context: this,
      remaining: Infinity,
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
    this.remaining = parseInt(options.remaining) >= 1 ? parseInt(options.remaining) : Infinity;

    /**
     * The number of times the listener function was executed
     * @type {number}
     */
    this.count = 0;

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
    this.target.removeListener(
      this.event,
      this.callback,
      {context: this.context, remaining: this.remaining}
    );
  }

}
