import {EventEmitter} from "../src/djipevents.js";

// console.log("getListenerCount() reports the correct number of listeners");
// let ee = new EventEmitter();
// for (let i = 0; i < 100; i++) ee.on("test", () => {});
// console.log(ee.getListenerCount("test") === 100 ? "OK" : "FAIL" + "\n");
// ee = null;

// console.log("times is respected");
// let ee = new EventEmitter();
// ee.on("test", () => console.log("Exec!"), {times: 2});
// ee.emit("test");
// ee.emit("test");
// ee.emit("test");
// ee.emit("test");

// console.log("context is right");
// let ee3 = new EventEmitter();
// let obj = {};
// ee3.on("test", function() {
//   console.log(obj === this);
// }, {context: obj});
// ee3.emit("test");

// console.log("right names");
// let ee = new EventEmitter();
// ee.on("test1", () => {});
// ee.on("test2", () => {});
// ee.on("test3", () => {});
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

// console.log("hasListener works");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", () => {});
// console.log(ee.hasListener("test"));
// ee.off("test");
// console.log(ee.hasListener("test"));

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

