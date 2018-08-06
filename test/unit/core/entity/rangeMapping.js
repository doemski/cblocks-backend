const chai = require('chai');
const expect = chai.expect;

const rangeMap = require('../../../../core/entity/rangeMapping.js');
const stubs = require('../../../stubs/rangeMappings');

let map;
let value;

describe('Range Mappping', () => {
  describe('apply', () => {
    it('should return 0 if value less min', () => {
      givenMap();

      whenValueLessMinValue();

      shouldReturnMinValue();
    });

    it('should return 100 if value higher than max', () => {
      givenMap();

      whenValueMoreThanMax();

      shouldReturnMaxValue();
    });

    it('should be 50% in the middle', () => {
      givenMap();

      whenValueInMiddle();

      shouldReturn(50);
    });
  });

  describe('isApplicableFor', () => {
    it('should return true if resource is numeric',
      isApplicableShouldReturnTrueForNumericResource);

    it('should return false if resource is not numeric',
      isApplicableShouldReturnFalseIfResourceIsNotNumeric);
  });
});

function givenMap() {
  map = rangeMap.make(stubs.temperatureRangeMapping);
}

function whenValueLessMinValue() {
  value = map.apply(5);
}

function shouldReturnMinValue() {
  expect(value).to.equal(0);
}

function whenValueMoreThanMax() {
  value = map.apply(35);
}

function shouldReturnMaxValue() {
  expect(value).to.equal(100);
}

function whenValueInMiddle() {
  value = map.apply(25);
}

function isApplicableShouldReturnTrueForNumericResource() {
  givenMap();

  whenIsApplicableForNumericResource();

  shouldReturn(true);
}

function whenIsApplicableForNumericResource() {
  const resource = {
    'isNumeric': () => true,
  };

  value = map.isApplicableFor(resource);
}

function shouldReturn(val) {
  expect(value).to.equal(val);
}

function isApplicableShouldReturnFalseIfResourceIsNotNumeric() {
  givenMap();

  whenIsApplicableForNonNumericResource();

  shouldReturn(false);
}

function whenIsApplicableForNonNumericResource() {
  const resource = {
    'isNumeric': () => false,
  };

  value = map.isApplicableFor(resource);
}
