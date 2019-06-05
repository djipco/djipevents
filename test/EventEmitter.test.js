import {EventEmitter} from "../src/djipevents.js";


// console.log("getListenerCount() reports the correct number of listeners");
// let ee1 = new EventEmitter();
// for (let i = 0; i < 100; i++) ee1.on("test", () => {});
// console.log(ee1.getListenerCount("test") === 100 ? "OK" : "FAIL" + "\n");
// ee1 = null;


// console.log("once is respected");
// let ee2 = new EventEmitter();
// let total = 0;
//
// ee2.on("test", () => console.log("Exec!"), this, true);
//
// ee2.emit("test");
// ee2.emit("test");



// console.log("context is right");
// let ee3 = new EventEmitter();
// let obj = {};
// ee3.on("test", function() {
//   console.log(obj === this);
// }, obj);
// ee3.emit("test");


// console.log("right names");
// let ee = new EventEmitter();
// ee.on("test1", () => {});
// ee.on("test2", () => {});
// ee.on("test3", () => {});
// console.log(ee.getEventNames());


// console.log("right names when empty");
// let ee = new EventEmitter();
// console.log(ee.getEventNames());

// console.log("right names when stupid names");
// let ee = new EventEmitter();
// ee.on({}, () => {});
// ee.on(null, () => {});
// ee.on(undefined, () => {});
// ee.on(-1, () => {});
// console.log(ee.getEventNames());


// console.log("listeners are properly removed");
// let ee = new EventEmitter();
// let listener1 = ee.on("test", () => {});
// let listener2 = ee.on("test", () => {});
// let listener3 = ee.on("test3", () => {});
// let listener4 = ee.on("test4", () => {});
// let listener5 = ee.on("test5", () => {});
// console.log(ee.getEventNames());
// ee.off("test3", listener3.callback);
// ee.off("test5");
// console.log(ee.getEventNames());


// console.log("listeners are properly removed with respsect to context");
// let ee = new EventEmitter();
// let ctx = {};
// let listener1 = ee.on("test", () => {}, {context: ctx});
// ee.off("test", undefined, ctx);
//
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

console.log("suspend() works");
let ee = new EventEmitter();
let listener1 = ee.on("test", () => console.log("A"));
let listener2 = ee.on("test", () => console.log("B"));
let listener3 = ee.on("test", () => console.log("C"));
// ee.suspended = true;
ee.suspend("test");
ee.emit("test");
ee.unsuspend("test");
ee.emit("test");
