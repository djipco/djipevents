const Listener = require("../dist/djipevents.cjs.min.js").Listener;
const EventEmitter = require("../dist/djipevents.cjs.min.js").EventEmitter;
const {expect} = require("chai");

describe("Listener", function() {

  describe("constructor", function() {

    it("should throw when mandatory parameters are not present or of wrong type", function(done) {

      let f1a = () => new Listener();
      expect(f1a).to.throw(TypeError);

      let f1b = () => new Listener(123);
      expect(f1b).to.throw(TypeError);

      let f1c = () => new Listener({});
      expect(f1c).to.throw(TypeError);

      let f2 = () => new Listener("test");
      expect(f2).to.throw(ReferenceError);

      let f3a = () => new Listener("test", new EventEmitter());
      expect(f3a).to.throw(TypeError);

      let f3b = () => new Listener("test", new EventEmitter(), {});
      expect(f3b).to.throw(TypeError);

      let f4 = () => new Listener("test", new EventEmitter(), () => {});
      expect(f4).to.not.throw(TypeError);

      done();

    });

    // it("should set args properly", function() {
    //
    //   // Arrange
    //   let ee = new EventEmitter();
    //
    //   // Act
    //   let l1 = ee.addListener("test", () => {}, {args: "abc"});
    //   // let l2 = ee.addListener("test", () => {});
    //
    //   // Assert
    //   expect(l1.args).to.be.an("array");
    //   // expect(l1.args.length).to.equal(1);
    //   // expect(l2.args).to.be.undefined;
    //
    // });

    it("should set default options correctly", function() {

      // Arrange
      let ee = new EventEmitter();

      // Act
      let l = new Listener("test", ee, () => {});

      // Assert
      expect(l.context).to.equal(ee);
      expect(l.remaining).to.equal(Infinity);
      expect(l.args).to.be.undefined;

    });

    it("should set specified options correctly for regular events", function(done) {

      // Arrange
      let evt1 = "test";
      let target = new EventEmitter();
      let f = () => {};
      let ctx = {};
      let remaining = 23;
      let args = ["a", "b", "c"];

      // Act
      let l1 = new Listener(
        evt1,
        target,
        f,
        {context: ctx, remaining: remaining, args: args}
      );

      // Assert
      expect(l1.event).to.equal(evt1);
      expect(l1.target).to.equal(target);
      expect(l1.callback).to.equal(f);
      expect(l1.context).to.equal(ctx);
      expect(l1.remaining).to.equal(remaining);
      expect(l1.args).to.equal(args);

      done();

    });

    it("should set specified options correctly for global events", function(done) {

      // Arrange
      let evt = EventEmitter.ANY_EVENT;
      let target = new EventEmitter();
      let f = () => {};
      let ctx = {};
      let remaining = 23;
      let args = ["a", "b", "c"];

      // Act
      let l = new Listener(
        evt,
        target,
        f,
        {context: ctx, remaining: remaining, args: args}
      );

      // Assert
      expect(l.event).to.equal(evt);
      expect(l.target).to.equal(target);
      expect(l.callback).to.equal(f);
      expect(l.context).to.equal(ctx);
      expect(l.remaining).to.equal(remaining);
      expect(l.args).to.equal(args);

      done();

    });

    it("should convert args scalar values to single-entry array", function() {

      // Arrange
      let args = "abc";

      // Act
      let l = new Listener("test", new EventEmitter(), () => {}, {args: args});

      // Assert
      expect(l.args).to.be.an("array");
      expect(l.args.length).to.equal(1);

    });

  });

  describe("remove()", function() {

    it("should remove the listener", function(done) {

      let ee = new EventEmitter();

      let listener1 = ee.addListener("test", () => {});
      ee.addListener("test", () => {});
      ee.addListener("test", () => {});
      listener1.remove();

      let listener2 = ee.addListener(EventEmitter.ANY_EVENT, () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});
      ee.addListener(EventEmitter.ANY_EVENT, () => {});
      listener2.remove();

      expect(ee.getListenerCount("test")).to.equal(2);
      expect(ee.getListenerCount(EventEmitter.ANY_EVENT)).to.equal(2);

      done();

    });

  });

});
