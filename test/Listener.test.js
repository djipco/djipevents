const EventEmitter = require("../dist/djipevents.cjs.min.js").EventEmitter;
const {expect} = require("chai");

describe("Listener", function() {

  describe("constructor", function() {

    it("should set default options correctly");

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
