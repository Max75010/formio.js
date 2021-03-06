'use strict';

/* eslint-env mocha */
import { expect } from 'chai';
import writtenNumber from 'written-number';
import utils from './index';
import components from './fixtures/components.json';
import submission1 from './fixtures/submission1.json';

describe('eachComponent', () => {
  it('should iterate through nested components in the right order', () => {
    let n = 1;
    utils.eachComponent(components, (component) => {
      expect(component.order).to.equal(n);
      n += 1;
    });
  });

  it('should include layouts components if provided', () => {
    let numComps = 0;
    let numLayout = 0;
    utils.eachComponent(components, (component) => {
      if (utils.isLayoutComponent(component)) {
        numLayout++;
      }
      else {
        numComps++;
      }
    }, true);
    expect(numLayout).to.be.equal(3);
    expect(numComps).to.be.equal(8);
  });

  it('Should provide the paths to all of the components', () => {
    const paths = [
      'one',
      'parent1',
      'two',
      'parent2',
      'three',
      '',
      'four',
      'five',
      'six',
      'seven',
      'eight'
    ];
    const testPaths = [];
    utils.eachComponent(components, (component, path) => {
      testPaths.push(path);
    }, true);
    expect(paths).to.deep.equal(testPaths);
  });

  it('Should be able to find all textfield components', () => {
    const comps = utils.findComponents(components, {type: 'textfield'});
    expect(comps.length).to.equal(6);
  });

  it('Should be able to find components with special properties.', () => {
    const components3 = require('./fixtures/components3.json');
    const comps = utils.findComponents(components3, {'properties.path': 'a'});
    expect(comps.length).to.equal(4);
    expect(comps[0].key).to.equal('b');
    expect(comps[1].key).to.equal('e');
    expect(comps[2].key).to.equal('j');
    expect(comps[3].key).to.equal('m');
  });

  it('Should be able to generate paths based on component types', () => {
    const components = require('./fixtures/components2.json');
    const paths = [
      'a',
      'b',
      'c',
      'd',
      'f',
      'f.g',
      'f.h',
      'f.i',
      'e',
      'j',
      'k',
      'k.n',
      'k.n.o',
      'k.n.p',
      'k.n.q',
      'k.m',
      'k.l',
      'r',
      'submit'
    ];
    const testPaths = [];
    utils.eachComponent(components, (component, path) => {
      testPaths.push(path);
    }, true);
    expect(paths).to.deep.equal(testPaths);
  });

  it('Should still provide the correct paths when it is not recursive', () => {
    const paths = [
      'a',
      'd',
      'f',
      'f.g',
      'f.h',
      'f.i',
      'e',
      'j',
      'k',
      'k.n',
      'k.n.o',
      'k.n.p',
      'k.n.q',
      'k.m',
      'k.l',
      'r',
      'submit'
    ];
    const testPaths = [];
    utils.eachComponent(require('./fixtures/components2.json'), (component, path) => {
      testPaths.push(path);
    });
    expect(paths).to.deep.equal(testPaths);
  });

  it('should be able to block recursion', () => {
    let numComps = 0;
    let numLayout = 0;
    utils.eachComponent(components, (component) => {
      if (utils.isLayoutComponent(component)) {
        numLayout++;
      }
      else {
        numComps++;
      }

      if (component.type === 'table') {
        let numInTable = 0;
        [].concat.apply([], component.rows).forEach((row) => {
          utils.eachComponent(row.components, () => {
            numInTable++;
          });
        });
        expect(numInTable).to.be.equal(4);
        return true;
      }
    }, true);
    expect(numLayout).to.be.equal(3);
    expect(numComps).to.be.equal(4);
  });
});

describe('getComponent', () => {
  it('should return the correct components', () => {
    for (let n = 1; n <= 8; n += 1) {
      const component = utils.getComponent(components, writtenNumber(n));
      expect(component).not.to.be.null;
      expect(component).not.to.be.undefined;
      expect(component).to.be.an('object');
      expect(component.order).to.equal(n);
      expect(component.key).to.equal(writtenNumber(n));
    }
  });

  it('should work with a different this context', () => {
    for (let n = 1; n <= 8; n += 1) {
      const component = utils.getComponent.call({}, components, writtenNumber(n));
      expect(component).not.to.be.null;
      expect(component).not.to.be.undefined;
      expect(component).to.be.an('object');
      expect(component.order).to.equal(n);
      expect(component.key).to.equal(writtenNumber(n));
    }
  });
});

describe('flattenComponents', () => {
  it('should return an object of flattened components', () => {
    const flattened = utils.flattenComponents(components);
    for (let n = 1; n <= 8; n += 1) {
      const component = flattened[writtenNumber(n)];
      expect(component).not.to.be.undefined;
      expect(component).to.be.an('object');
      expect(component.order).to.equal(n);
      expect(component.key).to.equal(writtenNumber(n));
    }
  });

  it('should work with a different this context', () => {
    const flattened = utils.flattenComponents.call({}, components);
    for (let n = 1; n <= 8; n += 1) {
      const component = flattened[writtenNumber(n)];
      expect(component).not.to.be.undefined;
      expect(component).to.be.an('object');
      expect(component.order).to.equal(n);
      expect(component.key).to.equal(writtenNumber(n));
    }
  });
});

describe('getValue', () => {
  it('should be able to get a simple value', () => {
    expect(utils.getValue(submission1, 'name')).to.be.equal(submission1.data.name);
  });

  it('should be able to get a value from a container', () => {
    expect(utils.getValue(submission1, 'animalname')).to.be.equal(submission1.data.mycontainer.animalname);
  });
});

describe('parseFloat', () => {
  it('should clear input and parse value', () => {
    expect(utils.parseFloat('12,345,678.90')).to.be.equal(12345678.90);
  });
});

describe('formatAsCurrency', () => {
  it('should be able to format Float value for Currency component', () => {
    expect(utils.formatAsCurrency(123.4)).to.be.equal('123.40');
    expect(utils.formatAsCurrency(12345678.9)).to.be.equal('12,345,678.90');
    expect(utils.formatAsCurrency(12345678.915)).to.be.equal('12,345,678.92');
  });

  it('should be able to format String value for Currency component', () => {
    expect(utils.formatAsCurrency('12345678.915')).to.be.equal('12,345,678.92');
  });
});

describe('checkCalculated', () => {
  it('should be able to calculate value based on javascript code', () => {
    const component = {
      key: 'sum',
      calculateValue: 'value = 3'
    };
    const data = {};

    utils.checkCalculated(component, null, data);
    expect(data.sum).to.be.equal(3);
  });

  it('should be able to calculate value based on json logic', () => {
    const component = {
      key: 'sum',
      calculateValue: {
        '_.sum': { var: 'data.test' }
      }
    };
    const data = { test: [ 1, 2, 3 ] };

    utils.checkCalculated(component, null, data);
    expect(data.sum).to.be.equal(6);
  });
});

describe('checkCondition', () => {
  it('should display component by default', () => {
    expect(utils.checkCondition({}, null, {})).to.be.equal(true);
  });

  it('should be able to calculate condition based on javascript code', () => {
    const component = {
      key: 'sum',
      customConditional: 'show = data.test === 3'
    };
    const data1 = { test: 3 };
    const data2 = { test: 5 };

    expect(utils.checkCondition(component, null, data1)).to.be.equal(true);
    expect(utils.checkCondition(component, null, data2)).to.be.equal(false);
  });

  it('should be able to calculate condition based on json logic', () => {
    const component = {
      key: 'sum',
      conditional: {
        json: {
          '===': [
            { '_.sum': { var: 'data.test' } },
            6
          ]
        }
      }
    };
    const data1 = { test: [ 1, 2, 3 ] };
    const data2 = { test: [ 1, 2, 4 ] };

    expect(utils.checkCondition(component, null, data1)).to.be.equal(true);
    expect(utils.checkCondition(component, null, data2)).to.be.equal(false);
  });
});

describe('getDateSetting', () => {
  it('should return null if no date provided', () => {
    expect(utils.getDateSetting()).to.be.equal(null);
    expect(utils.getDateSetting(null)).to.be.equal(null);
    expect(utils.getDateSetting(undefined)).to.be.equal(null);
    expect(utils.getDateSetting(NaN)).to.be.equal(null);
    expect(utils.getDateSetting('')).to.be.equal(null);
    expect(utils.getDateSetting('should be invalid')).to.be.equal(null);
  });

  it('should return valid Date on serialized date provided', () => {
    const date = new Date(0);

    expect(utils.getDateSetting(date)).to.be.eql(date).but.not.equal(date);
    expect(utils.getDateSetting(date.valueOf())).to.be.eql(date);
    expect(utils.getDateSetting(date.toString())).to.be.eql(date);
    expect(utils.getDateSetting(date.toISOString())).to.be.eql(date);
  });

  it('should be able to get value using moment APIs', () => {
    const validMomentExpression = 'moment(0)';
    const validDate = new Date(0);
    const invalidMomentExpression = "moment('')";

    expect(utils.getDateSetting(validMomentExpression)).to.be.eql(validDate);
    expect(utils.getDateSetting(invalidMomentExpression)).to.be.equal(null);
  });
});
