const Listener = require("../dist/djipevents.cjs.min.js").Listener;
const EventEmitter = require("../dist/djipevents.cjs.min.js").EventEmitter;
const {expect} = require("chai");

describe("Listener", function() {

  describe("constructor", function() {

    it("should throw when mandatory parameters are not present or of wrong type", function(done) {

      let f1 = () => new Listener();
      expect(f1).to.throw(TypeError);

      let f2 = () => new Listener("test");
      expect(f2).to.throw(ReferenceError);

      let f3 = () => new Listener("test", new EventEmitter());
      expect(f3).to.throw(TypeError);

      let f4 = () => new Listener("test", new EventEmitter(), () => {});
      expect(f4).to.not.throw(TypeError);

      done();

    });

    it("should set default options correctly", function(done) {

      let l1 = new Listener("test", new EventEmitter(), () => {});
      expect(l1.context).to.equal(l1);
      expect(l1.count).to.equal(Infinity);
      expect(l1.data).to.be.undefined;

      done();

    });

    it("should set specified options correctly", function(done) {

      let evt1 = "test";
      let target = new EventEmitter();
      let f = () => {};
      let ctx = {};
      let count = 23;
      let data = {};

      let l1 = new Listener(
        evt1,
        target,
        f,
        {context: ctx, count: count, data: data}
      );

      expect(l1.event).to.equal(evt1);
      expect(l1.target).to.equal(target);
      expect(l1.callback).to.equal(f);
      expect(l1.context).to.equal(ctx);
      expect(l1.count).to.equal(count);
      expect(l1.data).to.equal(data);

      let evt2 = EventEmitter.ANY_EVENT;

      let l2 = new Listener(
        evt2,
        target,
        f,
        {context: ctx, count: count, data: data}
      );

      expect(l2.event).to.equal(evt2);

      done();

    });

  });

  describe("remove()", function() {

    it("should remove the listener", function(done) {

      let ee = new EventEmitter();

      let listener1 = ee.on("test", () => {});
      ee.on("test", () => {});
      ee.on("test", () => {});
      listener1.remove();

      let listener2 = ee.on(EventEmitter.ANY_EVENT, () => {});
      ee.on(EventEmitter.ANY_EVENT, () => {});
      ee.on(EventEmitter.ANY_EVENT, () => {});
      listener2.remove();

      expect(ee.getListenerCount("test")).to.equal(2);
      expect(ee.getListenerCount(EventEmitter.ANY_EVENT)).to.equal(2);

      done();

    });

  });

});
