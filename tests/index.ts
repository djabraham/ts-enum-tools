/* global describe it after should require */

declare var require: any;
declare var should: any;
declare var describe: any;
declare var after: any;
declare var it: any;

var should = require('should');

import { EnumFlagsTest, EnumFlagsType, EnumFlagsTool, EnumStringsType, EnumStringsTool } from '../index';

var Stats = { };

function Timer() {
  return {
    start: new Date().getTime(),
    elapsed: function () { return new Date().getTime() - this.start }
  }
}

function PadValue(value, length) { 
  var padded = " " + value;
  return (padded.length <= length) ? PadValue(padded, length) : padded;
}

function truthy(val) {
  if (!val) {
    var err = new Error("Invalid truth assertion");
    // return (<any>err).stack;     
    throw err;
  }
}

function falsey(val) {
  if (val) {
    var err = new Error("Invalid false assertion");
    // (<any>err).stack;     
    throw err;
  }
}



////////////////////////////////////////////////////////////
// Strings

// Declare a TypeScript enum
export enum AbStrings {
  None      = <any> "none",
  Select    = <any> "sel",
  Move      = <any> "mov",
  Edit      = <any> "edit",
  Sort      = <any> "sort",
  Clone     = <any> "clone"
}

// Create a map for string output and comparison
export interface AbStringsMap {
  None:   any;
  Select: any;
  Move:   any;
  Edit:   any;
  Sort:   any;
  Clone:  any;
}

// Declare a secondary closure validation enum
export enum AbStringsChecked {
  Good      = <any> "good",
  Better    = <any> "better",
}

// Method 1: Get function that accepts a String and returns a set of tools
// Filter truthys that valid keys are capitalized
var abStrFunc = EnumStringsType<AbStrings, AbStringsMap>(AbStrings, "abStrProp", function(k) {
  return (k != k.toLowerCase()); 
});

// The tools function includes getters of type string, when map is provided
truthy(abStrFunc.key.Clone === "Clone");             // Returns key
truthy(abStrFunc.val.Clone === "clone");             // Returns value

// Tools function works on enum types
var abStrEnum: AbStrings = AbStrings.Clone;

// console.log(abStrFunc(abStrEnum).equals(AbStrings.Move));

truthy(abStrFunc(abStrEnum).state.Clone);
falsey(abStrFunc(abStrEnum).state.Select);
truthy(abStrFunc(abStrEnum).equals(AbStrings.Clone));
falsey(abStrFunc(abStrEnum).equals(AbStrings.Move));
truthy(abStrFunc(abStrEnum).toStringKey() === "Clone");
truthy(abStrFunc(abStrEnum).toStringVal() === "clone");

// Method 2: Add Interface that extends a Number with a tools property
export interface AbString extends String {
  abStrProp?: EnumStringsTool<AbStrings, AbStringsMap>;
}

// Tools properties are then accessible on extended string types
var abStrVal: AbString = abStrFunc.val.Clone;

truthy(abStrVal.abStrProp.state.Clone === true);
falsey(abStrVal.abStrProp.state.Move);
truthy(abStrFunc(abStrEnum).equals(AbStrings.Clone));
falsey(abStrVal.abStrProp.equals(AbStrings.Move));
truthy(abStrVal.abStrProp.toStringKey() === "Clone");
truthy(abStrVal.abStrProp.toStringVal() === "clone");

describe('EnumStringsType', function() {
  describe('Various logic tests', function() {
    it('should clone', function() {
      should(abStrVal.abStrProp.equals(AbStrings.Clone)).equal(true);
    });
    it('should not move', function() {
      should(abStrVal.abStrProp.equals(AbStrings.Move)).equal(false);
    });
    it('should not sort', function() {
      should(abStrVal.abStrProp.equals(AbStrings.Sort)).equal(false);
    });
    it('should have property of Clone that is true', function() {
      should(abStrVal.abStrProp.state.Clone).equal(true);
    });
    it('should have property of Move that is false', function() {
      should(abStrVal.abStrProp.state.Move).equal(false);
    });
    it('should ouput a string', function() {
      should(abStrVal.abStrProp.toStringKey()).equal("Clone");
    });
  });

  describe('Outlier checks', function() {
    it('should maintain closure integrity when re-used', function() {
      // Adding another enum using the factory method
      var AbCheck = EnumStringsType<AbStringsChecked, typeof AbStringsChecked>(AbStringsChecked, "abStringCheck");
      var abValCheck: number = AbStringsChecked.Good
      should(AbCheck(abValCheck).state.Good).equal(true);
        
      // Double checking original enum integrity
      should(abStrVal.abStrProp.equals(AbStrings.Clone)).equal(true);
      should(abStrVal.abStrProp.state.Clone).equal(true);
      should(abStrVal.abStrProp.equals(AbStrings.Move)).equal(false);
      should(abStrVal.abStrProp.state.Move).equal(false);
    });
  });
});


////////////////////////////////////////////////////////////
// Flags

// Declare a TypeScript enum
export enum AbFlags {
  isNone        = 0,
  isMovable     = 1 << 2,
  isSelectable  = 1 << 3,
  isEditable    = 1 << 28,
  isSortable    = 1 << 30,
  isClonable    = 1 << 31,   // maximum!
  isSelectSort  = isSelectable | isSortable   // example combo flag
}

// Create a map for number output
export interface AbFlagsMap {
  isNone:         boolean;
  isSelectable:   boolean;
  isMovable:      boolean;
  isEditable:     boolean;
  isSortable:     boolean;
  isClonable:     boolean;      
}

// Declare a secondary closure validation enum
export enum AbFlagsChecked {
  None          = 0,
  isGood        = 1 << 2,
  isBetter      = 1 << 4,
}

// Method 1: Simple raw test methods
var abFlgRaw = AbFlags.isClonable | AbFlags.isSortable;

truthy(EnumFlagsTest.has(abFlgRaw, AbFlags.isClonable));
falsey(EnumFlagsTest.has(abFlgRaw, AbFlags.isMovable));

truthy(EnumFlagsTest.has(abFlgRaw, AbFlags.isClonable | AbFlags.isSortable));
falsey(EnumFlagsTest.has(abFlgRaw, AbFlags.isMovable | AbFlags.isSortable));

truthy(EnumFlagsTest.any(abFlgRaw, AbFlags.isMovable | AbFlags.isSortable));
truthy(EnumFlagsTest.any(abFlgRaw, AbFlags.isClonable));
falsey(EnumFlagsTest.any(abFlgRaw, AbFlags.isMovable));

truthy(EnumFlagsTest.eql(abFlgRaw, AbFlags.isClonable | AbFlags.isSortable));
falsey(EnumFlagsTest.eql(abFlgRaw, AbFlags.isClonable));
falsey(EnumFlagsTest.eql(abFlgRaw, AbFlags.isMovable));
      
// Method 2: Get enum wrapper function that binds a Number to a set of tools
var abFlgFunc = EnumFlagsType<AbFlags, AbFlagsMap>(AbFlags, "abFlgProp");

// Tools function works on enum | number types
var abFlgEnum: AbFlags = AbFlags.isClonable | AbFlags.isSortable;

truthy(abFlgFunc(abFlgEnum).state.isClonable);
falsey(abFlgFunc(abFlgEnum).state.isMovable);

truthy(abFlgFunc(abFlgEnum).has(AbFlags.isClonable));
falsey(abFlgFunc(abFlgEnum).has(AbFlags.isMovable));

truthy(abFlgFunc(abFlgEnum).has(AbFlags.isClonable | AbFlags.isSortable));
falsey(abFlgFunc(abFlgEnum).has(AbFlags.isMovable | AbFlags.isSortable));

truthy(abFlgFunc(abFlgEnum).any(AbFlags.isMovable | AbFlags.isSortable));
truthy(abFlgFunc(abFlgEnum).any(AbFlags.isClonable));
falsey(abFlgFunc(abFlgEnum).any(AbFlags.isMovable));

truthy(abFlgFunc(abFlgEnum).eql(AbFlags.isClonable | AbFlags.isSortable));
falsey(abFlgFunc(abFlgEnum).eql(AbFlags.isClonable));
falsey(abFlgFunc(abFlgEnum).eql(AbFlags.isMovable));

truthy(abFlgFunc(abFlgEnum).toArray().length === 2);
truthy(abFlgFunc(abFlgEnum).toString().indexOf("isSortable") + 1);

// Method 3: Add Interface that extends a Number with a tools property
export interface AbNumber extends Number {
  abFlgProp?: EnumFlagsTool<AbFlags, AbFlagsMap>;
}

// Tools properties are available on extended number types
var abFlgVal: AbNumber = AbFlags.isClonable | AbFlags.isSortable;

truthy(abFlgVal.abFlgProp.state.isClonable);
falsey(abFlgVal.abFlgProp.state.isMovable);

truthy(abFlgVal.abFlgProp.has(AbFlags.isClonable));
falsey(abFlgVal.abFlgProp.has(AbFlags.isMovable));

truthy(abFlgVal.abFlgProp.has(AbFlags.isClonable | AbFlags.isSortable));
falsey(abFlgVal.abFlgProp.has(AbFlags.isMovable | AbFlags.isSortable));

truthy(abFlgVal.abFlgProp.any(AbFlags.isMovable | AbFlags.isSortable));
truthy(abFlgVal.abFlgProp.any(AbFlags.isClonable));
falsey(abFlgVal.abFlgProp.any(AbFlags.isMovable));

truthy(abFlgVal.abFlgProp.eql(AbFlags.isClonable | AbFlags.isSortable));
falsey(abFlgVal.abFlgProp.eql(AbFlags.isClonable));
falsey(abFlgVal.abFlgProp.eql(AbFlags.isMovable));

truthy(abFlgVal.abFlgProp.toArray().length === 2);
truthy(abFlgVal.abFlgProp.toString().indexOf("isSortable") + 1);

describe('EnumFlagsType: Various tests', function() {
  this.timeout(8000);
  
  describe('Rigorous logic tests', function() {
    it('should handle case val(1000) > has(1000):t  any(1000):t  eql(1000):t  state[1000]:t  state[0100]:f ', function() {
      let val = (1 << 3);
      should(abFlgFunc(val).has(AbFlags.isSelectable)).equal(true);
      should(abFlgFunc(val).any(AbFlags.isSelectable)).equal(true);
      should(abFlgFunc(val).eql(AbFlags.isSelectable)).equal(true);
      should(abFlgFunc(val).state.isSelectable).equal(true);
      should(abFlgFunc(val).state.isMovable).equal(false);
    });
    it('should handle case val(1100) > has(1100):t  any(1100):t  eql(1100):t  state[1000]:t  state[0100]:t ', function() {
      let val = ((1 << 3) | (1 << 2));
      should(abFlgFunc(val).has(AbFlags.isSelectable | AbFlags.isMovable)).equal(true);
      should(abFlgFunc(val).any(AbFlags.isSelectable | AbFlags.isMovable)).equal(true);
      should(abFlgFunc(val).eql(AbFlags.isSelectable | AbFlags.isMovable)).equal(true);
      should(abFlgFunc(val).state.isSelectable).equal(true);
      should(abFlgFunc(val).state.isMovable).equal(true);
    });
    it('should handle case val(0100) > has(1000):f  any(1000):f  eql(1000):f  state[1000]:f  state[0100]:t ', function() {
      let val = (1 << 2);
      should(abFlgFunc(val).has(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).any(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).eql(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).state.isSelectable).equal(false);
      should(abFlgFunc(val).state.isMovable).equal(true);
    });
    it('should handle case val(1100) > has(0100):t  any(0100):t  eql(0100):f  state[1000]:t  state[0100]:t ', function() {
      let val = ((1 << 3) | (1 << 2));
      should(abFlgFunc(val).has(AbFlags.isMovable)).equal(true);
      should(abFlgFunc(val).any(AbFlags.isMovable)).equal(true);
      should(abFlgFunc(val).eql(AbFlags.isMovable)).equal(false);
      should(abFlgFunc(val).state.isSelectable).equal(true);
      should(abFlgFunc(val).state.isMovable).equal(true);
    });
    it('should handle case val(0100) > has(1100):f  any(1100):t  eql(1100):f  state[1000]:f  state[0100]:t ', function() {
      let val = (1 << 2);
      should(abFlgFunc(val).has(AbFlags.isSelectable | AbFlags.isMovable)).equal(false);
      should(abFlgFunc(val).any(AbFlags.isSelectable | AbFlags.isMovable)).equal(true);
      should(abFlgFunc(val).eql(AbFlags.isSelectable | AbFlags.isMovable)).equal(false);
      should(abFlgFunc(val).state.isSelectable).equal(false);
      should(abFlgFunc(val).state.isMovable).equal(true);
    });
    it('should handle case val(0000) > has(1000):f  any(1000):t  eql(1000):f  state[1000]:f  state[0100]:f ', function() {
      let val = (0);
      should(abFlgFunc(val).has(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).any(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).eql(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).state.isSelectable).equal(false);
      should(abFlgFunc(val).state.isMovable).equal(false);
    });
    it('should handle case val(0000) > has(0000):t  any(0000):f  eql(0000):t  state[0000]:t  state[0100]:f ', function() {
      let val = (0);
      should(abFlgFunc(val).has(0)).equal(true);
      should(abFlgFunc(val).any(0)).equal(false);
      should(abFlgFunc(val).eql(0)).equal(true);
      should(abFlgFunc(val).state.isNone).equal(true);
      should(abFlgFunc(val).state.isMovable).equal(false);
    });
  });
  
  describe('Miscellaneous logic tests', function() {  
    it('should handle invalid bit combinations in values and arguments', function() {
      let val = ((1 << 5) | (1 << 10));
      should(abFlgFunc(val).has(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).any(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).eql(AbFlags.isSelectable)).equal(false);
      should(abFlgFunc(val).has(val)).equal(true);
      should(abFlgFunc(val).any(val)).equal(true);
      should(abFlgFunc(val).eql(val)).equal(true);
    });
    it('should support various flags', function() {
      should(abFlgVal.abFlgProp.has(AbFlags.isClonable)).equal(true);
      should(abFlgVal.abFlgProp.has(AbFlags.isMovable)).equal(false);
      should(abFlgVal.abFlgProp.has(AbFlags.isSortable)).equal(true);
    });
    it('should support various properties', function() {
      should(abFlgVal.abFlgProp.state.isClonable).equal(true);
      should(abFlgVal.abFlgProp.state.isMovable).equal(false);
    });
    it('should return an array consisting of (2) flags', function() {
      should(abFlgVal.abFlgProp.toArray().length).equal(2);
    });
    it('should ouput a string similar to: "isSortable | isClonable"', function() {
      should(abFlgVal.abFlgProp.toString()).containEql("isClonable");
      should(abFlgVal.abFlgProp.toString()).containEql("isSortable");
    });
  });
  
  describe('Outlier checks', function() {  
    it('should maintain closure integrity and support re-use', function() {
      // Adding another enum using the factory method
      var AbCheck = EnumFlagsType<AbFlagsChecked, typeof AbFlagsChecked>(AbFlagsChecked, "abChecked");
      var abValCheck: number = AbFlagsChecked.isGood
      should(AbCheck(abValCheck).state.isGood).equal(true);
        
      // Double checking original enum integrity
      should(abFlgVal.abFlgProp.has(AbFlags.isClonable)).equal(true);
      should(abFlgVal.abFlgProp.state.isClonable).equal(true);
      should(abFlgVal.abFlgProp.toString()).containEql("isClonable");
      should(abFlgVal.abFlgProp.toString()).containEql("isSortable");
    });
    it('should be immutable value when using function methods', function() {
      var changingValue: AbNumber = 0;
      // function binds to value passed in, so it gets captured
      changingValue = AbFlags.isClonable | AbFlags.isSortable;
      var toolsImmutable = abFlgFunc(changingValue);
      should(toolsImmutable.state.isClonable).be.true;
      should(!toolsImmutable.state.isEditable).be.true;

      changingValue = AbFlags.isMovable | AbFlags.isEditable;
      should(toolsImmutable.state.isClonable).be.true;
      should(!toolsImmutable.state.isEditable).be.true;
    });
    it('should not be immutable value when using prototype properties', function() {
      var changingValue: AbNumber = 0;
      // prototype methods are created on the fly, so it acts on current value
      changingValue = AbFlags.isClonable | AbFlags.isSortable;
      should(changingValue.abFlgProp.state.isClonable).be.true;
      should(!changingValue.abFlgProp.state.isEditable).be.true;

      changingValue = AbFlags.isMovable | AbFlags.isEditable;
      should(changingValue.abFlgProp.state.isEditable).be.true;
      should(!changingValue.abFlgProp.state.isClonable).be.true;
    });
  });
  describe('Performance checks', function() {  
    let iterationsFunc = 1000000;
    
    it(`should perform function(value) tools over (${iterationsFunc}) iterations`, function() {
      let timer = Timer();

      let variousFlagValues = [
        AbFlags.isSelectable,
        AbFlags.isMovable,
        AbFlags.isEditable,
        AbFlags.isSortable,
        AbFlags.isClonable,
        AbFlags.isSelectable | AbFlags.isClonable,
        AbFlags.isEditable | AbFlags.isMovable,
        AbFlags.isSortable | AbFlags.isClonable,
        AbFlags.isSelectable | AbFlags.isClonable | AbFlags.isEditable,
        AbFlags.isClonable | AbFlags.isMovable | AbFlags.isEditable | AbFlags.isSelectable
      ]

      let x = 0;
      let flag = false;
      for (let i = 0; i < iterationsFunc; i++) {
        // A function is resuseable, so it is typically faster when repeated use is likely
        let toolsPerInteration = abFlgFunc(variousFlagValues[x]);
        flag = toolsPerInteration.has(AbFlags.isClonable);
        flag = toolsPerInteration.any(AbFlags.isClonable);
        flag = toolsPerInteration.state.isClonable;
        x = (++x < 10) ? x : 0;
      }

      Stats["func"] = timer.elapsed();
    });

    let iterationsAll = 1000000;
    it(`should perform using value.has property over (${iterationsAll}) iterations`, function() {
      let timer = Timer();

      let flag = false;
      for (let i = 0; i < iterationsAll; i++) {
        flag = abFlgVal.abFlgProp.has(AbFlags.isClonable);
      }
      should(flag).equal(true);

      Stats["prop"] = timer.elapsed();
    });

    let iterationsAny = 1000000;
    it(`should perform using value.any property over (${iterationsAny}) iterations`, function() {
      let flag = false;
      for (let i = 0; i < iterationsAny; i++) {
        flag = abFlgVal.abFlgProp.any(AbFlags.isSortable);
      }
      should(flag).equal(true);
    });

    let iterationsMap = 1000000;
    it(`should perform using value.state property over (${iterationsMap}) iterations`, function() {
      let flag = false;
      for (let i = 0; i < iterationsMap; i++) {
        flag = abFlgVal.abFlgProp.state.isClonable;
      }
      should(flag).equal(true);
    });

    let iterationsBase = 5000000;
    it(`inline logical operation comparison baseline (${iterationsBase}) iterations`, function() {
      let timer = Timer();

      let valA: any = AbFlags.isMovable | AbFlags.isSortable;
      let valB: any = AbFlags.isClonable | AbFlags.isSortable;
      let flag = false;
      for (let i = 0; i < iterationsBase; i++) {
        flag = EnumFlagsTest.has(valA, AbFlags.isMovable);  // t
        flag = EnumFlagsTest.any(valB, AbFlags.isMovable);  // f
      }

      Stats["base"] = timer.elapsed();
    });
  });

  after(function() {
    // console.log(`\n\n  Stats Func/Prop/Base:${PadValue(Stats["func"], 6)}${PadValue(Stats["prop"], 6)}${PadValue(Stats["base"], 6)}`);
  });
});

