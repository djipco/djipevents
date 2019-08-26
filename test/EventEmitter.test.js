const EventEmitter = require("../dist/djipevents.cjs.min.js").EventEmitter;
const {expect} = require("chai");
const sinon = require("sinon");

describe("EventEmitter", function() {

  describe("constructor", function() {

    it("should set 'suspended' property to boolean, no matter the input", function () {

      // Arrange
      let falsy = [undefined, false, 0, null];
      let truthy = [true, 1];

      // Act
      let result1 = falsy.map(value => new EventEmitter(value).suspended);
      let result2 = truthy.map(value => new EventEmitter(value).suspended);

      // Assert
      expect(result1).to.all.include(false).and.not.include(true);
      expect(result2).to.all.include(true).and.not.include(false);

    });

    it("should set 'map' property to empty object, always", function () {

      // Arrange
      let ee = new EventEmitter();

      // Act & Assert
      expect(ee.map).to.be.a("object").and.be.empty;

    });

  });

  describe("emit()", function() {

    it("should throw TypeError when an invalid event is specified", function () {

      // Arrange
      let ee = new EventEmitter();
      let values = [EventEmitter.ANY_EVENT, undefined, null, Infinity, 123, {}, []];

      // Act
      let functions = values.map(value => () => ee.emit(value));

      // Assert
      functions.forEach(f => expect(f).to.throw(TypeError));

    });

    it("should trigger the callback the right number of times", function () {

      // Arrange
      let ee = new EventEmitter();
      let spy = sinon.spy();
      let times = 3;
      ee.addListener("test", spy, {remaining: times});

      // Act
      for (var i = 0; i < times + 1; i++) ee.emit("test");

      // Assert
      expect(spy.calledThrice).to.be.true;
      expect(ee.getListenerCount("test")).to.equal(0);

    });

    it("should execute the callback using the right value for 'this'", function(done) {

      // Arrange
      let ee = new EventEmitter();
      let obj = {};

      // Act & Assert
      ee.addListener("test", function() {
        expect(this).to.equal(obj);
        done();
      }, {context: obj});
      ee.emit("test");

    });

    it("should relay arguments passed when adding the listener to callback function ", function() {

      // Arrange
      let ee = new EventEmitter();
      let args = ["a", "b", "c"];
      let cb = function() { return arguments; };
      ee.addListener("test", cb,{arguments: args});

      // Act
      let result = ee.emit("test");

      // Assert
      expect(result[0][0]).to.equal(args[0]);
      expect(result[0][1]).to.equal(args[1]);
      expect(result[0][2]).to.equal(args[2]);

    });

    it("should relay args passed to emit() to callback function", function() {

      // Arrange
      let ee = new EventEmitter();
      let arg1 = "y";
      let arg2 = "z";
      let cb = function() { return arguments; };
      ee.addListener("test", cb);

      // Act
      let result = ee.emit("test", arg1, arg2);

      // Assert
      expect(result[0][0]).to.equal(arg1);
      expect(result[0][1]).to.equal(arg2);

    });

    it("should relay args from addListener() and from emit() to callback function", function() {

      // Arrange
      let ee1 = new EventEmitter();
      let ee2 = new EventEmitter();
      let ee3 = new EventEmitter();
      let args = ["a", "b", "c"];
      let arg1 = "y";
      let arg2 = "z";
      let cb = function() { return arguments; };

      // Act
      ee1.addListener("test", cb, {arguments: args});
      let result1 = ee1.emit("test", arg1, arg2);
      ee2.addListener("test", cb);
      let result2 = ee2.emit("test", arg1, arg2);
      ee3.addListener("test", cb, {arguments: args});
      let result3 = ee3.emit("test");

      // Assert
      expect(result1[0][0]).to.equal(arg1);
      expect(result1[0][1]).to.equal(arg2);
      expect(result1[0][2]).to.equal(args[0]);
      expect(result1[0][3]).to.equal(args[1]);
      expect(result1[0][4]).to.equal(args[2]);

      expect(result2[0][0]).to.equal(arg1);
      expect(result2[0][1]).to.equal(arg2);

      expect(result3[0][0]).to.equal(args[0]);
      expect(result3[0][1]).to.equal(args[1]);
      expect(result3[0][2]).to.equal(args[2]);

    });

    it("should fire callbacks added via EventEmitter.ANY_EVENT", function() {

      // Arrange
      let ee = new EventEmitter();
      let spy1 = sinon.spy();
      let spy2 = sinon.spy();
      ee.addListener("test", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, spy1);
      ee.addListener(EventEmitter.ANY_EVENT, spy2);

      // Act
      ee.emit("test");

      // Assert
      expect(spy1.calledOnce).to.be.true;
      expect(spy2.calledOnce).to.be.true;

    });

    it("should properly increment the 'count' property of the listener object", function() {

      // Arrange
      let ee = new EventEmitter();
      let spy = sinon.spy();
      let listener = ee.addListener("test", spy);

      // Act
      for (let i = 0; i < 42; i++) ee.emit("test");

      // Assert
      expect(spy.callCount).to.equal(listener.count);

    });

    it("should not execute callbacks when EventEmitter's 'suspended' is true", function () {

      // Arrange
      let ee = new EventEmitter(true);
      let spy = sinon.spy();
      ee.addListener("test", spy);
      ee.addListener(EventEmitter.ANY_EVENT, spy);

      // Act
      for (let i = 0; i < 42; i++) ee.emit("test");

      // Assert
      expect(spy.callCount).to.equal(0);

    });

    it("should not execute callbacks when Listener's 'suspended' is true", function () {

      // Arrange
      let ee = new EventEmitter();
      let spy = sinon.spy();
      let l1 = ee.addListener("test", spy);
      let l2 = ee.addListener(EventEmitter.ANY_EVENT, spy);
      l1.suspended = true;
      l2.suspended = true;

      // Act
      for (let i = 0; i < 42; i++) ee.emit("test");

      // Assert
      expect(spy.callCount).to.equal(0);

    });

    it("should return the correct values as gathered from all callbacks", function () {

      // Arrange
      let ee = new EventEmitter();
      let cb1 = () => 123;
      let cb2 = () => "abc";
      ee.addListener("test", cb1);
      ee.addListener("test", cb2);

      // Act
      let results = ee.emit("test");

      // Assert
      expect(results[0]).to.equal(123);
      expect(results[1]).to.equal("abc");

    });

  });

  describe("eventCount", function() {

    it("should return correct number of unique events (excluding global events)", function() {

      // Arrange
      let ee = new EventEmitter();

      // Act
      ee.addListener("test1", () => {});
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // Assert
      expect(ee.eventCount).to.equal(2);

    });

  });

  describe("eventNames", function() {

    it("should return an array with unique event names (excluding global events)", function() {

      // Arrange
      let ee = new EventEmitter();

      // Act
      ee.addListener(EventEmitter.ANY_EVENT, () => {});
      ee.addListener("test1", () => {});
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // Assert
      expect(ee.eventNames[0]).to.equal("test1");
      expect(ee.eventNames[1]).to.equal("test2");
      expect(ee.eventNames[2]).to.be.undefined;

    });

  });

  describe("getListenerCount()", function() {

    it("should report the correct number of listeners for regular events", function() {

      // Arrange
      let ee = new EventEmitter();
      let times = 12;

      // Act
      for (let i = 0; i < times; i++) ee.addListener("test", () => {});
      for (let i = 0; i < 23; i++) ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // Assert
      expect(ee.getListenerCount("test")).to.equal(times);

    });

    it("should report the correct number of listeners for ANY_EVENT", function() {

      // Arrange
      let ee = new EventEmitter();
      let times = 23;

      // Act
      for (let i = 0; i < 12; i++) ee.addListener("test", () => {});
      for (let i = 0; i < times; i++) ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // Assert
      expect(ee.getListenerCount(EventEmitter.ANY_EVENT)).to.equal(times);

    });

    it("should report 0 for unknown or invalid events", function() {

      // Arrange
      let ee = new EventEmitter();
      let values = [undefined, {}, null, "bogus", Infinity, EventEmitter.ANY_EVENT];

      // Act
      let functions = values.map(value => () => ee.getListenerCount(value));

      // Assert
      functions.forEach(f => expect(f()).to.equal(0));

    });

  });

  describe("getListeners()", function() {

    it("should report the correct listeners, in the right order, for regular events", function() {

      // Arrange
      let ee = new EventEmitter();

      // Act
      let listener1 = ee.addListener("test", () => {});
      let listener2 = ee.addListener("test", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});
      let listener3 = ee.addListener("test", () => {});
      let listener4 = ee.addListener("test", () => {}, {prepend: true});

      // Assert
      expect(ee.getListeners("test")[0]).to.equal(listener4);
      expect(ee.getListeners("test")[1]).to.equal(listener1);
      expect(ee.getListeners("test")[2]).to.equal(listener2);
      expect(ee.getListeners("test")[3]).to.equal(listener3);

    });

    it("should report the correct ANY_EVENT listeners, in the right order", function() {

      // Arrange
      let ee = new EventEmitter();

      // Act
      let listener1 = ee.addListener(EventEmitter.ANY_EVENT, () => {});
      let listener2 = ee.addListener(EventEmitter.ANY_EVENT, () => {});
      ee.addListener("test", () => {});
      let listener3 = ee.addListener(EventEmitter.ANY_EVENT, () => {});
      let listener4 = ee.addListener(EventEmitter.ANY_EVENT, () => {}, {prepend: true});

      // Assert
      expect(ee.getListeners(EventEmitter.ANY_EVENT)[0]).to.equal(listener4);
      expect(ee.getListeners(EventEmitter.ANY_EVENT)[1]).to.equal(listener1);
      expect(ee.getListeners(EventEmitter.ANY_EVENT)[2]).to.equal(listener2);
      expect(ee.getListeners(EventEmitter.ANY_EVENT)[3]).to.equal(listener3);

    });

    it("should return empty array for unregistered or invalid events", function() {

      // Arrange
      let ee = new EventEmitter();
      ee.addListener("test", () => {});
      let values = [undefined, null, {}, EventEmitter.ANY_EVENT, "bogus"];

      // Act
      let functions = values.map(value => () => ee.getListeners(value));

      // Assert
      functions.forEach(f => expect(f().length).to.equal(0));

    });

  });

  describe("hasListener()", function() {

    it("should report true if no param is passed & at least 1 listener is registered", function() {

      // Arrange
      let ee = new EventEmitter();

      // Act
      ee.addListener("test", () => {});

      // Assert
      expect(ee.hasListener()).to.be.true;

    });

    it("should report false if no param is passed and no listeners are registered", function() {

      // Arrange
      let ee = new EventEmitter();

      // Assert
      expect(ee.hasListener()).to.be.false;

    });

    it("should report the correct boolean value", function() {

      // Arrange
      let ee = new EventEmitter();

      // Act
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener("test3", () => {});
      ee.addListener("test3", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // Assert
      expect(ee.hasListener(null)).to.be.false;
      expect(ee.hasListener("test1")).to.be.true;
      expect(ee.hasListener("test2")).to.be.true;
      expect(ee.hasListener("test3")).to.be.true;
      expect(ee.hasListener(EventEmitter.ANY_EVENT)).to.be.true;

    });

  });

  describe("removeListener()", function() {

    it("should remove all listeners when no parameter is passed (including ANY_EVENT)", function() {

      // Arrange
      let ee = new EventEmitter();
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener("test3", () => {});
      ee.addListener("test3", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // Act
      ee.removeListener();

      // Assert
      expect(ee.hasListener("test1")).to.be.false;
      expect(ee.hasListener("test2")).to.be.false;
      expect(ee.hasListener("test3")).to.be.false;
      expect(ee.hasListener(EventEmitter.ANY_EVENT)).to.be.false;
      expect(ee.getListenerCount()).to.equal(0);

    });

    it("should remove specified regular listeners", function() {

      // Arrange
      let ee = new EventEmitter();
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener("test3", () => {});
      ee.addListener("test3", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // Act
      ee.removeListener("test1");

      // Assert
      expect(ee.hasListener("test1")).to.be.false;
      expect(ee.hasListener("test2")).to.be.true;
      expect(ee.hasListener("test3")).to.be.true;
      expect(ee.hasListener(EventEmitter.ANY_EVENT)).to.be.true;

    });

    it("should remove EventEmitter.ANY_EVENT listeners when specified", function() {

      // Arrange
      let ee = new EventEmitter();
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener("test3", () => {});
      ee.addListener("test3", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // Act
      ee.removeListener(EventEmitter.ANY_EVENT);

      // Assert
      expect(ee.hasListener("test1")).to.be.true;
      expect(ee.hasListener("test2")).to.be.true;
      expect(ee.hasListener("test3")).to.be.true;
      expect(ee.hasListener(EventEmitter.ANY_EVENT)).to.be.false;

    });

    it("should remove listeners matching the specified event and callback", function() {

      // Arrange
      let ee = new EventEmitter();
      let cb = () => {};
      ee.addListener("test1", cb);
      ee.addListener("test2", cb);
      ee.addListener("test3", cb);
      ee.addListener("test3", cb);
      ee.addListener(EventEmitter.ANY_EVENT, cb);

      // Act
      ee.removeListener("test3", cb);

      // Assert
      expect(ee.hasListener("test1")).to.be.true;
      expect(ee.hasListener("test2")).to.be.true;
      expect(ee.hasListener("test3")).to.be.false;
      expect(ee.hasListener(EventEmitter.ANY_EVENT)).to.be.true;
      expect(ee.eventCount).to.equal(2);

    });

    it("should remove listeners matching the specified event and remaining count", function() {

      // Arrange
      let ee = new EventEmitter();
      let cb = () => {};
      ee.addListener("test1", cb, {remaining: 5});
      ee.addListener("test2", cb);
      ee.addListener("test3", cb, {remaining: 5});
      ee.addListener("test3", cb);
      ee.addListener(EventEmitter.ANY_EVENT, cb);

      // Act
      ee.emit("test1");
      ee.emit("test3");
      ee.removeListener("test1", cb, {remaining: 4});
      ee.removeListener("test3", undefined, {remaining: 4});

      // Assert
      expect(ee.hasListener("test1")).to.be.false;
      expect(ee.hasListener("test2")).to.be.true;
      expect(ee.hasListener("test3")).to.be.true;
      expect(ee.hasListener(EventEmitter.ANY_EVENT)).to.be.true;
      expect(ee.getListenerCount("test1")).to.equal(0);
      expect(ee.getListenerCount("test3")).to.equal(1);

    });

    it("should remove listeners matching the specified event and context", function() {

      // Arrange
      let ee = new EventEmitter();
      let cb = () => {};
      let ctx = {};
      ee.addListener("test1", cb, {context: ctx});
      ee.addListener("test2", cb);
      ee.addListener("test3", cb, {context: ctx});
      ee.addListener("test3", cb);
      ee.addListener(EventEmitter.ANY_EVENT, cb);

      // Act
      ee.removeListener("test1", cb, {context: ctx});
      ee.removeListener("test3", undefined, {context: ctx});

      // Assert
      expect(ee.hasListener("test1")).to.be.false;
      expect(ee.hasListener("test2")).to.be.true;
      expect(ee.hasListener("test3")).to.be.true;
      expect(ee.hasListener(EventEmitter.ANY_EVENT)).to.be.true;
      expect(ee.getListenerCount("test1")).to.equal(0);
      expect(ee.getListenerCount("test3")).to.equal(1);

    });

  });

  describe("addListener()", function() {

    it("should throw when mandatory parameters are not present or of wrong type", function(done) {

      let ee = new EventEmitter();

      let f1 = () => ee.addListener();
      expect(f1).to.throw(TypeError);

      let f2 = () => ee.addListener("test");
      expect(f2).to.throw(TypeError);

      let f3 = () => ee.addListener("test", () => {});
      expect(f3).to.not.throw();

      done();

    });

    it("should set default options correctly", function() {

      // Arrange
      let ee = new EventEmitter();

      // Act
      let l = ee.addListener("test", () => {});
      let listeners = ee.getListeners("test");

      // Assert
      expect(l.context).to.equal(ee);
      expect(l.remaining).to.equal(Infinity);
      expect(l.data).to.be.undefined;
      expect(listeners[listeners.length - 1]).to.equal(l);

    });

    it("should obey specified 'duration' parameter", function(done) {

      let ee = new EventEmitter();
      let cb = sinon.spy();
      ee.addListener("test", cb, {duration: 50});

      ee.emit("test");

      setTimeout(() => {
        ee.emit("test");
        expect(cb.calledOnce).to.be.true;
        done();
      }, 100);

    });

    it("should obey specified 'prepend' parameter", function(done) {

      let ee = new EventEmitter();

      ee.addListener("test", () => {});
      let l2 = ee.addListener("test", () => {}, {prepend: true});
      ee.addListener("test", () => {});

      let listeners = ee.getListeners("test");
      expect(listeners[0]).to.equal(l2);

      done();

    });

    it("should obey specified 'remaining' parameter", function(done) {

      let ee = new EventEmitter();
      let spy = sinon.spy();

      ee.addListener("test", spy, {remaining: 3});

      ee.emit("test");
      ee.emit("test");
      ee.emit("test");
      ee.emit("test");

      expect(spy.calledThrice).to.be.true;
      expect(ee.getListenerCount("test")).to.equal(0);

      done();

    });

    it("should default to Infinity when the 'remaining' parameter is invalid", function(done) {

      [-1, 0, undefined, null, {}, -Infinity].forEach(value => {
        let ee = new EventEmitter();
        let l = ee.addListener("test", () => {}, {remaining: value});
        expect(l.remaining).to.equal(Infinity);
      });

      done();

    });

  });

  describe("once()", function() {

    it("should only execute callback once", function(done) {

      let ee = new EventEmitter();
      let spy = sinon.spy();

      ee.addListener("test", spy, {remaining: 1});

      ee.emit("test");
      ee.emit("test");
      ee.emit("test");
      ee.emit("test");

      expect(spy.calledOnce).to.be.true;
      expect(ee.getListenerCount("test")).to.equal(0);

      done();

    });

  });

  describe("suspend()", function() {

    it("should suspend callback execution for regular events", function(done) {

      let spy = sinon.spy();

      let ee = new EventEmitter();
      ee.addListener("test", spy);

      ee.emit("test");
      expect(spy.calledOnce).to.be.true;
      ee.suspend("test");
      ee.emit("test");
      ee.emit("test");
      ee.emit("test");
      expect(spy.calledOnce).to.be.true;

      done();

    });

    it("should suspend callback execution for EventEmitter.ANY_EVENT", function(done) {

      let spy = sinon.spy();

      let ee = new EventEmitter();
      ee.addListener(EventEmitter.ANY_EVENT, spy);

      ee.emit("test");
      expect(spy.calledOnce).to.be.true;
      ee.suspend(EventEmitter.ANY_EVENT);
      ee.emit("test");
      ee.emit("test");
      ee.emit("test");
      expect(spy.calledOnce).to.be.true;

      done();

    });

  });

  describe("unsuspend()", function() {

    it("should resume callback execution for regular events", function(done) {

      let spy = sinon.spy();

      let ee = new EventEmitter();
      ee.addListener("test", spy);

      ee.emit("test");
      expect(spy.calledOnce).to.be.true;
      ee.suspend("test");
      ee.emit("test");
      ee.emit("test");
      ee.unsuspend("test");
      ee.emit("test");
      expect(spy.calledTwice).to.be.true;

      done();

    });

    it("should resume callback execution for EventEmitter.ANY_EVENT", function(done) {

      let spy = sinon.spy();

      let ee = new EventEmitter();
      ee.addListener(EventEmitter.ANY_EVENT, spy);

      ee.emit("test");
      expect(spy.calledOnce).to.be.true;
      ee.suspend(EventEmitter.ANY_EVENT);
      ee.emit("test");
      ee.emit("test");
      ee.unsuspend(EventEmitter.ANY_EVENT);
      ee.emit("test");
      expect(spy.calledTwice).to.be.true;

      done();

    });


  });

  describe("suspended", function() {

    it("should correctly suspend events", function(done) {

      let ee = new EventEmitter();
      let listener1 = ee.addListener("test1", () => {});
      let listener2 = ee.addListener("test2", () => {});
      let listener3 = ee.addListener(EventEmitter.ANY_EVENT, () => {});

      let spy1 = sinon.spy(listener1, "callback");
      let spy2 = sinon.spy(listener2, "callback");
      let spy3 = sinon.spy(listener3, "callback");

      ee.suspended = true;
      ee.emit("test1");
      ee.emit("test2");
      ee.emit("test2");

      ee.suspended = false;
      ee.emit("test1");
      ee.emit("test2");
      ee.emit("test2");

      expect(spy1.calledOnce).to.be.true;
      expect(spy2.calledTwice).to.be.true;
      expect(spy3.calledThrice).to.be.true;

      done();

    });

  });

  describe("waitFor()", function() {

    it("should resolve promise when event is triggered", function(done) {

      // Arrange
      let ee = new EventEmitter();

      setTimeout(() => {
        ee.emit("test");
      }, 25);

      // Act & Assert
      ee.waitFor("test").then(done);

    });

    it("should resolve promise when any event is triggered if using ANY_EVENT", function(done) {

      // Arrange
      let ee = new EventEmitter();

      setTimeout(() => {
        ee.emit("test");
      }, 25);

      // Act & Assert
      ee.waitFor(EventEmitter.ANY_EVENT).then(done);

    });

    it("should resolve promise when event is triggered within duration period", function(done) {

      // Arrange
      let ee = new EventEmitter();

      setTimeout(() => {
        ee.emit("test");
      }, 25);

      // Act & Assert
      ee.waitFor("test", {duration: 50}).then(done);

    });

    it("should resolve within duration period if using ANY_EVENT", function(done) {

      // Arrange
      let ee = new EventEmitter();

      setTimeout(() => {
        ee.emit("test");
      }, 25);

      // Act & Assert
      ee.waitFor(EventEmitter.ANY_EVENT, {duration: 50}).then(done);

    });

    it("should reject promise when event is not triggered within duration period", function(done) {

      // Arrange
      let ee = new EventEmitter();

      // Act & Assert
      ee.waitFor(EventEmitter.ANY_EVENT, {duration: 25}).catch(err => {
        expect(err).to.equal("The duration expired before the event was emitted.");
        done();
      });

    });

    it("should reject if event is not triggered within duration using ANY_EVENT", function(done) {

      // Arrange
      let ee = new EventEmitter();

      // Act & Assert
      ee.waitFor(EventEmitter.ANY_EVENT, {duration: 25}).catch(err => {
        expect(err).to.equal("The duration expired before the event was emitted.");
        done();
      });

    });

    it("should remove listener when event is not triggered within duration period", function(done) {

      // Arrange
      let ee = new EventEmitter();

      // Act & Assert
      ee.waitFor("test", {duration: 25}).catch(() => {
        expect(ee.hasListener("test")).to.be.false;
        done();
      });

    });

  });

});


// console.log("times is respected");
// let ee = new EventEmitter();
// ee.addListener("test", () => console.log("Exec!"), {times: 2});
// ee.emit("test");
// ee.emit("test");
// ee.emit("test");
// ee.emit("test");

// console.log("right names");
// let ee = new EventEmitter();
// ee.addListener("test1", () => {});
// ee.addListener("test2", () => {});
// ee.addListener("test3", () => {});
// console.log(ee.eventNames);

// console.log("right names when empty");
// let ee = new EventEmitter();
// console.log(ee.eventNames);

// console.log("right names when stupid names");
// let ee = new EventEmitter();
// ee.on({}, () => {});
// ee.on(null, () => {});
// ee.on(undefined, () => {});
// ee.on(-1, () => {});
// console.log(ee.eventNames);

// console.log("listeners are properly removed with respect to callback");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", () => {});
// let listener2 = ee.on("test", () => {});
// let listener3 = ee.on("test3", () => {});
// let listener4 = ee.on("test4", () => {});
// let listener5 = ee.on("test5", () => {});
// console.log(ee.eventNames);
// ee.off("test3", listener2.callback);
// ee.off("test5");
// console.log(ee.eventNames);

// console.log("listeners are properly removed with respsect to context");
// let ee = new EventEmitter();
// let ctx1 = {};
// let ctx2 = {};
// let listener1 = ee.on("test", () => {}, {context: ctx1});
// ee.off("test", undefined, {context: ctx2});
// console.log(ee.getListeners("test"));

// console.log("listeners are properly removed with respsect to times");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", () => {}, {times: 2});
// ee.emit("test");
// ee.off("test", undefined, {times: 1});
// console.log(ee.getListeners("test"));

// console.log("listeners self removes");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", e => {});
// listener1.remove();
// console.log(ee.getListeners("test"));

// console.log("suspended works");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", () => console.log("Coucou!"));
// ee.suspended = true;
// ee.emit("test");

// console.log("suspend() works");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", () => console.log("A"));
// let listener2 = ee.on("test", () => console.log("B"));
// let listener3 = ee.on("test", () => console.log("C"));
// // ee.suspended = true;
// ee.suspend("test");
// ee.emit("test");
// ee.unsuspend("test");
// ee.emit("test");

// console.log("the result of the listener functions is properly collected");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", () => "Hello, ");
// let listener2 = ee.on("test", () => "World!");
// let results = ee.emit("test");
// console.log(results);

// console.log("prepemd works");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", () => console.log("A"));
// let listener2 = ee.on("test", () => console.log("B"));
// let listener3 = ee.on("test", () => console.log("C"), {prepend: true});
// let results = ee.emit("test");

// console.log("prepemd works with once");
// let ee = new EventEmitter();
// let listener1 = ee.once("test", () => console.log("A"));
// let listener2 = ee.once("test", () => console.log("B"));
// let listener3 = ee.once("test", () => console.log("C"), {prepend: true});
// let results = ee.emit("test");

// console.log("duration works");
// let ee = new EventEmitter();
// let listener1a = ee.on("test", () => console.log("A"), {duration: 2000});
// let listener1b = ee.on("test", () => console.log("A"), {duration: 2000});
// let listener2 = ee.on("test", () => console.log("B"), {duration: 3000});
// console.log(ee.getListeners("test"));
// setTimeout(() => {
//   console.log(ee.getListeners("test"));
//   ee.emit("test");
//   console.log(ee.getListeners("test"));
// }, 2500);
// setTimeout(() => {
//   console.log(ee.getListeners("test"));
// }, 3500);

// console.log("duration works even when removed");
// let ee = new EventEmitter();
// let listener1a = ee.on("test", () => console.log("A"), {duration: 2000});
// console.log(ee.getListeners("test"));
// listener1a.remove();
// console.log(ee.getListeners("test"));
// setTimeout(() => {
//   console.log(ee.getListeners("test"));
// }, 2500);

// console.log("EventEmitter.ANY_EVENT works");
// let ee = new EventEmitter();
// let listener1 = ee.on(EventEmitter.ANY_EVENT, () => console.log("A1"));
// let listener1b = ee.on(EventEmitter.ANY_EVENT, () => console.log("A2"));
// let listener2 = ee.on("test", () => console.log("B"));
// let listener3 = ee.on("test", () => console.log("C"));
// let listener4 = ee.on("prout", () => console.log("d"));
// let listener5 = ee.on("allo", () => console.log("e"));
// console.log(ee.getListenerCount(EventEmitter.ANY_EVENT));

// console.log("haslistener works with any");
// let ee = new EventEmitter();
// ee.on(EventEmitter.ANY_EVENT, () => console.log("A1"));
// ee.on(EventEmitter.ANY_EVENT, () => console.log("e"));
// console.log(ee.hasListener(EventEmitter.ANY_EVENT));

// console.log("eventnames ignores doAny symbols");
// let ee = new EventEmitter();
// let listener1 = ee.on(EventEmitter.ANY_EVENT, () => console.log("A1"));
// let listener5 = ee.on("test", () => console.log("e"));
// console.log(ee.eventNames);

// console.log("getlisteners works with symbols");
// let ee = new EventEmitter();
// ee.on(EventEmitter.ANY_EVENT, () => console.log("A1"));
// ee.on(EventEmitter.ANY_EVENT, () => console.log("e"));
// ee.on(EventEmitter.ANY_EVENT, () => console.log("egg"));
// ee.getListeners(EventEmitter.ANY_EVENT).forEach(l => console.log(l));

// console.log("emit works with doAny");
// let ee = new EventEmitter();
// ee.on(EventEmitter.ANY_EVENT, () => console.log("A"));
// ee.on("test", () => console.log("A"));
// ee.on(EventEmitter.ANY_EVENT, () => console.log("C"));
// ee.on("test", () => console.log("D"));
// ee.on(EventEmitter.ANY_EVENT, () => console.log("E"));
// ee.emit("test");

// console.log("off works with EventEmitter.ANY_EVENT");
// let ee = new EventEmitter();
// ee.on(EventEmitter.ANY_EVENT, () => console.log("A"));
// // ee.off(EventEmitter.ANY_EVENT);
// ee.on("test", () => console.log("B"));
// ee.off("test");
// ee.on(EventEmitter.ANY_EVENT, () => console.log("C"));
// // ee.off(EventEmitter.ANY_EVENT);
// ee.on("test", () => console.log("D"));
// // ee.off("test");
// ee.emit("test");
// console.log(ee.events);