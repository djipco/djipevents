const EventEmitter = require("../dist/djipevents.cjs.min.js").EventEmitter;
const {expect} = require("chai");
const sinon = require("sinon");

describe("EventEmitter", function() {

  describe("constructor", function() {

    it("should set the correct status for 'suspended'", function (done) {

      [undefined, false, 0].forEach(value => {
        let ee = new EventEmitter(value);
        expect(ee.suspended).to.be.false;
      });

      [true, 1].forEach(value => {
        let ee = new EventEmitter(value);
        expect(ee.suspended).to.be.true;
      });

      done();

    });

  });

  describe("emit()", function() {

    it("should throw on invalid event parameter", function (done) {

      let ee = new EventEmitter();

      [EventEmitter.ANY_EVENT, undefined, null, Infinity, 123, {}].forEach(value => {
        let f = () => ee.emit(value);
        expect(f).to.throw(TypeError);
      });

      done();

    });

    it("should trigger the callback the right number of times", function (done) {

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

    it("should execute the callback using the right value for 'this'", function(done) {

      let ee = new EventEmitter();
      let obj = {};
      ee.addListener("test", function() {
        expect(this).to.equal(obj);
        done();
      }, {context: obj});
      ee.emit("test");

    });

    it("should not execute callbacks when EventEmitter's 'suspended' is true");

    it("should not execute callbacks when Listener's 'suspended' is true");

    it("should return the correct values");

    it("should pass along all the arguments to the callback functions");

    it("should pass on the value and data to the callback");

    it("should fire callbacks added via EventEmitter.ANY_EVENT", function(done) {

      let spy1 = sinon.spy();
      let spy2 = sinon.spy();

      let ee = new EventEmitter();
      ee.addListener("test", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, spy1);
      ee.addListener(EventEmitter.ANY_EVENT, spy2);

      ee.emit("test");

      expect(spy1.calledOnce).to.be.true;
      expect(spy2.calledOnce).to.be.true;

      done();

    });

    it("should properly increment the 'count' property of the listener object", function(done) {

      let spy = sinon.spy();
      let ee = new EventEmitter();
      let listener = ee.addListener("test", spy);
      for (let i = 0; i < 42; i++) ee.emit("test");

      setTimeout(() => {
        expect(spy.callCount).to.equal(listener.count);
        done();
      }, 25);

    });

  });

  describe("eventCount", function() {

    it("should return correct number of unique events (excluding global events)", function(done) {

      let ee = new EventEmitter();
      ee.addListener("test1", () => {});
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      expect(ee.eventCount).to.equal(2);

      done();

    });

  });

  describe("eventNames", function() {

    it("should return an array with unique event names (excluding global events)", function(done) {

      let ee = new EventEmitter();
      ee.addListener(EventEmitter.ANY_EVENT, () => {});
      ee.addListener("test1", () => {});
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      expect(ee.eventNames[0]).to.equal("test1");
      expect(ee.eventNames[1]).to.equal("test2");
      expect(ee.eventNames[2]).to.be.undefined;

      done();

    });

  });

  describe("getListenerCount()", function() {

    it("should report the correct number of listeners for regular events", function() {
      let ee = new EventEmitter();
      for (let i = 0; i < 12; i++) ee.addListener("test", () => {});
      for (let i = 0; i < 23; i++) ee.addListener(EventEmitter.ANY_EVENT, () => {});
      expect(ee.getListenerCount("test")).to.equal(12);
    });

    it("should report the correct number of listeners for global events", function() {
      let ee = new EventEmitter();
      for (let i = 0; i < 12; i++) ee.addListener("test", () => {});
      for (let i = 0; i < 23; i++) ee.addListener(EventEmitter.ANY_EVENT, () => {});
      expect(ee.getListenerCount(EventEmitter.ANY_EVENT)).to.equal(23);
    });

    it("should report 0 for unknown or invalid events", function(done) {
      let ee = new EventEmitter();
      expect(ee.getListenerCount(undefined)).to.equal(0);
      expect(ee.getListenerCount({})).to.equal(0);
      expect(ee.getListenerCount(null)).to.equal(0);
      done();
    });

  });

  describe("getListeners()", function() {

    it("should report the correct listeners for regular events", function(done) {
      let ee = new EventEmitter();
      let listener1 = ee.addListener("test", () => {});
      let listener2 = ee.addListener("test", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});
      let listener3 = ee.addListener("test", () => {});
      let listener4 = ee.addListener("test", () => {}, {prepend: true});
      expect(ee.getListeners("test")[0]).to.equal(listener4);
      expect(ee.getListeners("test")[1]).to.equal(listener1);
      expect(ee.getListeners("test")[2]).to.equal(listener2);
      expect(ee.getListeners("test")[3]).to.equal(listener3);
      done();
    });

    it("should report the correct global listeners", function(done) {
      let ee = new EventEmitter();
      let listener1 = ee.addListener(EventEmitter.ANY_EVENT, () => {});
      let listener2 = ee.addListener(EventEmitter.ANY_EVENT, () => {});
      ee.addListener("test", () => {});
      let listener3 = ee.addListener(EventEmitter.ANY_EVENT, () => {});
      let listener4 = ee.addListener(EventEmitter.ANY_EVENT, () => {}, {prepend: true});
      expect(ee.getListeners(EventEmitter.ANY_EVENT)[0]).to.equal(listener4);
      expect(ee.getListeners(EventEmitter.ANY_EVENT)[1]).to.equal(listener1);
      expect(ee.getListeners(EventEmitter.ANY_EVENT)[2]).to.equal(listener2);
      expect(ee.getListeners(EventEmitter.ANY_EVENT)[3]).to.equal(listener3);
      done();
    });

    it("should return empty array for unknow or invalid events", function(done) {
      let ee = new EventEmitter();
      expect(ee.getListeners(undefined).length).to.equal(0);
      expect(ee.getListeners(null).length).to.equal(0);
      expect(ee.getListeners({}).length).to.equal(0);
      expect(ee.getListeners(EventEmitter.ANY_EVENT).length).to.equal(0);
      expect(ee.getListeners("test").length).to.equal(0);
      done();
    });

  });

  describe("hasListener()", function() {

    it("should report the correct boolean value", function(done) {

      let ee = new EventEmitter();
      ee.addListener("test1", () => {});
      ee.addListener("test2", () => {});
      ee.addListener("test3", () => {});
      ee.addListener("test3", () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});

      // expect(ee.hasListener(undefined)).to.be.false;
      // expect(ee.hasListener(null)).to.be.false;
      expect(ee.hasListener("test1")).to.be.true;
      expect(ee.hasListener("test2")).to.be.true;
      expect(ee.hasListener("test3")).to.be.true;
      expect(ee.hasListener(EventEmitter.ANY_EVENT)).to.be.true;

      done();

    });

    it("should check if any listener is registered when no argument is provided", function(done) {

      let ee = new EventEmitter();
      let listener1 = ee.addListener("test", () => {});
      expect(ee.hasListener()).to.be.true;

      listener1.remove();
      expect(ee.hasListener()).to.be.false;

      let listener2 = ee.addListener(EventEmitter.ANY_EVENT, () => {});
      expect(ee.hasListener()).to.be.true;

      listener2.remove();
      expect(ee.hasListener()).to.be.false;

      done();

    });

  });

  describe("off()", function() {

    it("to do");

  });

  describe("on()", function() {

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

    it("should set default options correctly", function(done) {

      let ee = new EventEmitter();
      let l = ee.addListener("test", () => {});

      expect(l.context).to.equal(ee);
      expect(l.remaining).to.equal(Infinity);
      expect(l.data).to.be.undefined;

      let listeners = ee.getListeners("test");
      expect(listeners[listeners.length - 1]).to.equal(l);

      done();

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

    it("should set other options correctly", function(done) {

      let evt1 = "test";
      let cb = () => {};
      let ctx = {};
      let remaining = 12;
      let data = {};

      let ee = new EventEmitter();
      let l = ee.addListener(evt1, cb, {
        context: ctx,
        data: data,
        remaining: remaining
      });

      expect(l.event).to.equal(evt1);
      expect(l.callback).to.equal(cb);
      expect(l.context).to.equal(ctx);
      expect(l.remaining).to.equal(remaining);
      expect(l.data).to.equal(data);

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