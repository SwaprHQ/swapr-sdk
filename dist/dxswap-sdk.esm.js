import JSBI from 'jsbi';
export { default as JSBI } from 'jsbi';
import { proxies } from 'dxswap-core/.openzeppelin/kovan.json';
import invariant from 'tiny-invariant';
import { getNetwork } from '@ethersproject/networks';
import { getDefaultProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import warning from 'tiny-warning';
import { getAddress, getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import IDXswapPair from 'dxswap-core/build/contracts/IDXswapPair.json';
import IDXswapFactory from 'dxswap-core/build/contracts/IDXswapFactory.json';
import _Big from 'big.js';
import toFormat from 'toformat';
import _Decimal from 'decimal.js-light';

var _FACTORY_ADDRESS, _SOLIDITY_TYPE_MAXIMA;
var ChainId;

(function (ChainId) {
  ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
  ChainId[ChainId["ROPSTEN"] = 3] = "ROPSTEN";
  ChainId[ChainId["RINKEBY"] = 4] = "RINKEBY";
  ChainId[ChainId["G\xD6RLI"] = 5] = "G\xD6RLI";
  ChainId[ChainId["KOVAN"] = 42] = "KOVAN";
})(ChainId || (ChainId = {}));

var TradeType;

(function (TradeType) {
  TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(TradeType || (TradeType = {}));

var Rounding;

(function (Rounding) {
  Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(Rounding || (Rounding = {}));

var FACTORY_ADDRESS = (_FACTORY_ADDRESS = {}, _FACTORY_ADDRESS[ChainId.MAINNET] = '0x0000000000000000000000000000000000000001', _FACTORY_ADDRESS[ChainId.ROPSTEN] = '0x0000000000000000000000000000000000000003', _FACTORY_ADDRESS[ChainId.RINKEBY] = '0x0000000000000000000000000000000000000004', _FACTORY_ADDRESS[ChainId.GÖRLI] = '0x0000000000000000000000000000000000000005', _FACTORY_ADDRESS[ChainId.KOVAN] = proxies['dxswap-core/DXswapFactory'][0].address, _FACTORY_ADDRESS);
var INIT_CODE_HASH = '0x25dd05d38222d917e4487e1da5be545f4c08adc197eb59f87c597a13cf7791d2';
var MINIMUM_LIQUIDITY = /*#__PURE__*/JSBI.BigInt(1000); // exports for internal consumption

var ZERO = /*#__PURE__*/JSBI.BigInt(0);
var ONE = /*#__PURE__*/JSBI.BigInt(1);
var TWO = /*#__PURE__*/JSBI.BigInt(2);
var THREE = /*#__PURE__*/JSBI.BigInt(3);
var FIVE = /*#__PURE__*/JSBI.BigInt(5);
var TEN = /*#__PURE__*/JSBI.BigInt(10);
var _30 = /*#__PURE__*/JSBI.BigInt(30);
var _100 = /*#__PURE__*/JSBI.BigInt(100);
var _10000 = /*#__PURE__*/JSBI.BigInt(10000);
var SolidityType;

(function (SolidityType) {
  SolidityType["uint8"] = "uint8";
  SolidityType["uint256"] = "uint256";
})(SolidityType || (SolidityType = {}));

var SOLIDITY_TYPE_MAXIMA = (_SOLIDITY_TYPE_MAXIMA = {}, _SOLIDITY_TYPE_MAXIMA[SolidityType.uint8] = /*#__PURE__*/JSBI.BigInt('0xff'), _SOLIDITY_TYPE_MAXIMA[SolidityType.uint256] = /*#__PURE__*/JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), _SOLIDITY_TYPE_MAXIMA);

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o) {
  var i = 0;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  i = o[Symbol.iterator]();
  return i.next.bind(i);
}

// see https://stackoverflow.com/a/41102306
var CAN_SET_PROTOTYPE = ('setPrototypeOf' in Object);
var InsufficientReservesError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(InsufficientReservesError, _Error);

  function InsufficientReservesError() {
    var _this;

    _this = _Error.call(this) || this;
    _this.isInsufficientReservesError = true;
    _this.name = _this.constructor.name;
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_assertThisInitialized(_this), (this instanceof InsufficientReservesError ? this.constructor : void 0).prototype);
    return _this;
  }

  return InsufficientReservesError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var InsufficientInputAmountError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(InsufficientInputAmountError, _Error2);

  function InsufficientInputAmountError() {
    var _this2;

    _this2 = _Error2.call(this) || this;
    _this2.isInsufficientInputAmountError = true;
    _this2.name = _this2.constructor.name;
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(_assertThisInitialized(_this2), (this instanceof InsufficientInputAmountError ? this.constructor : void 0).prototype);
    return _this2;
  }

  return InsufficientInputAmountError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var ERC20 = [
	{
		constant: true,
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				name: "",
				type: "uint8"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	}
];

function validateSolidityTypeInstance(value, solidityType) {
  !JSBI.greaterThanOrEqual(value, ZERO) ? process.env.NODE_ENV !== "production" ? invariant(false, value + " is not a " + solidityType + ".") : invariant(false) : void 0;
  !JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]) ? process.env.NODE_ENV !== "production" ? invariant(false, value + " is not a " + solidityType + ".") : invariant(false) : void 0;
} // warns if addresses are not checksummed

function validateAndParseAddress(address) {
  try {
    var checksummedAddress = getAddress(address);
    process.env.NODE_ENV !== "production" ? warning(address === checksummedAddress, address + " is not checksummed.") : void 0;
    return checksummedAddress;
  } catch (error) {
     process.env.NODE_ENV !== "production" ? invariant(false, address + " is not a valid address.") : invariant(false) ;
  }
}
function parseBigintIsh(bigintIsh) {
  return bigintIsh instanceof JSBI ? bigintIsh : typeof bigintIsh === 'bigint' ? JSBI.BigInt(bigintIsh.toString()) : JSBI.BigInt(bigintIsh);
} // mock the on-chain sqrt function

function sqrt(y) {
  validateSolidityTypeInstance(y, SolidityType.uint256);
  var z = ZERO;
  var x;

  if (JSBI.greaterThan(y, THREE)) {
    z = y;
    x = JSBI.add(JSBI.divide(y, TWO), ONE);

    while (JSBI.lessThan(x, z)) {
      z = x;
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO);
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE;
  }

  return z;
} // given an array of items sorted by `comparator`, insert an item into its sort index and constrain the size to
// `maxSize` by removing the last item

function sortedInsert(items, add, maxSize, comparator) {
  !(maxSize > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_SIZE_ZERO') : invariant(false) : void 0; // this is an invariant because the interface cannot return multiple removed items if items.length exceeds maxSize

  !(items.length <= maxSize) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ITEMS_SIZE') : invariant(false) : void 0; // short circuit first item add

  if (items.length === 0) {
    items.push(add);
    return null;
  } else {
    var isFull = items.length === maxSize; // short circuit if full and the additional item does not come before the last item

    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add;
    }

    var lo = 0,
        hi = items.length;

    while (lo < hi) {
      var mid = lo + hi >>> 1;

      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    items.splice(lo, 0, add);
    return isFull ? items.pop() : null;
  }
}

var _CACHE, _WETH;
var CACHE = (_CACHE = {}, _CACHE[ChainId.MAINNET] = {
  '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': 9 // DGD

}, _CACHE);
var Token = /*#__PURE__*/function () {
  function Token(chainId, address, decimals, symbol, name) {
    validateSolidityTypeInstance(JSBI.BigInt(decimals), SolidityType.uint8);
    this.chainId = chainId;
    this.address = validateAndParseAddress(address);
    this.decimals = decimals;
    if (typeof symbol === 'string') this.symbol = symbol;
    if (typeof name === 'string') this.name = name;
  }

  Token.fetchData = function fetchData(chainId, address, provider, symbol, name) {
    try {
      var _CACHE2, _CACHE2$chainId;

      var _temp3 = function _temp3(parsedDecimals) {
        return new Token(chainId, address, parsedDecimals, symbol, name);
      };

      if (provider === undefined) provider = getDefaultProvider(getNetwork(chainId));

      var _temp4 = typeof ((_CACHE2 = CACHE) === null || _CACHE2 === void 0 ? void 0 : (_CACHE2$chainId = _CACHE2[chainId]) === null || _CACHE2$chainId === void 0 ? void 0 : _CACHE2$chainId[address]) === 'number';

      return Promise.resolve(_temp4 ? _temp3(CACHE[chainId][address]) : Promise.resolve(new Contract(address, ERC20, provider).decimals().then(function (decimals) {
        var _CACHE3, _extends2, _extends3;

        CACHE = _extends(_extends({}, CACHE), {}, (_extends3 = {}, _extends3[chainId] = _extends(_extends({}, (_CACHE3 = CACHE) === null || _CACHE3 === void 0 ? void 0 : _CACHE3[chainId]), {}, (_extends2 = {}, _extends2[address] = decimals, _extends2)), _extends3));
        return decimals;
      })).then(_temp3));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var _proto = Token.prototype;

  _proto.equals = function equals(other) {
    var equal = this.chainId === other.chainId && this.address === other.address;

    if (equal) {
      !(this.decimals === other.decimals) ? process.env.NODE_ENV !== "production" ? invariant(false, 'DECIMALS') : invariant(false) : void 0;
      if (this.symbol && other.symbol) !(this.symbol === other.symbol) ? process.env.NODE_ENV !== "production" ? invariant(false, 'SYMBOL') : invariant(false) : void 0;
      if (this.name && other.name) !(this.name === other.name) ? process.env.NODE_ENV !== "production" ? invariant(false, 'NAME') : invariant(false) : void 0;
    }

    return equal;
  };

  _proto.sortsBefore = function sortsBefore(other) {
    !(this.chainId === other.chainId) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_IDS') : invariant(false) : void 0;
    !(this.address !== other.address) ? process.env.NODE_ENV !== "production" ? invariant(false, 'ADDRESSES') : invariant(false) : void 0;
    return this.address.toLowerCase() < other.address.toLowerCase();
  };

  return Token;
}();
var WETH = (_WETH = {}, _WETH[ChainId.MAINNET] = /*#__PURE__*/new Token(ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'), _WETH[ChainId.ROPSTEN] = /*#__PURE__*/new Token(ChainId.ROPSTEN, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[ChainId.RINKEBY] = /*#__PURE__*/new Token(ChainId.RINKEBY, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[ChainId.GÖRLI] = /*#__PURE__*/new Token(ChainId.GÖRLI, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'), _WETH[ChainId.KOVAN] = /*#__PURE__*/new Token(ChainId.KOVAN, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'), _WETH);

var _toSignificantRoundin, _toFixedRounding;
var Decimal = /*#__PURE__*/toFormat(_Decimal);
var Big = /*#__PURE__*/toFormat(_Big);
var toSignificantRounding = (_toSignificantRoundin = {}, _toSignificantRoundin[Rounding.ROUND_DOWN] = Decimal.ROUND_DOWN, _toSignificantRoundin[Rounding.ROUND_HALF_UP] = Decimal.ROUND_HALF_UP, _toSignificantRoundin[Rounding.ROUND_UP] = Decimal.ROUND_UP, _toSignificantRoundin);
var toFixedRounding = (_toFixedRounding = {}, _toFixedRounding[Rounding.ROUND_DOWN] = 0, _toFixedRounding[Rounding.ROUND_HALF_UP] = 1, _toFixedRounding[Rounding.ROUND_UP] = 3, _toFixedRounding);
var Fraction = /*#__PURE__*/function () {
  function Fraction(numerator, denominator) {
    if (denominator === void 0) {
      denominator = ONE;
    }

    this.numerator = parseBigintIsh(numerator);
    this.denominator = parseBigintIsh(denominator);
  } // performs floor division


  var _proto = Fraction.prototype;

  _proto.invert = function invert() {
    return new Fraction(this.denominator, this.numerator);
  };

  _proto.add = function add(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));

    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator);
    }

    return new Fraction(JSBI.add(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.subtract = function subtract(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));

    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }

    return new Fraction(JSBI.subtract(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator)), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.lessThan = function lessThan(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return JSBI.lessThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.equalTo = function equalTo(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return JSBI.equal(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.greaterThan = function greaterThan(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return JSBI.greaterThan(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(otherParsed.numerator, this.denominator));
  };

  _proto.multiply = function multiply(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.numerator), JSBI.multiply(this.denominator, otherParsed.denominator));
  };

  _proto.divide = function divide(other) {
    var otherParsed = other instanceof Fraction ? other : new Fraction(parseBigintIsh(other));
    return new Fraction(JSBI.multiply(this.numerator, otherParsed.denominator), JSBI.multiply(this.denominator, otherParsed.numerator));
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    if (rounding === void 0) {
      rounding = Rounding.ROUND_HALF_UP;
    }

    !Number.isInteger(significantDigits) ? process.env.NODE_ENV !== "production" ? invariant(false, significantDigits + " is not an integer.") : invariant(false) : void 0;
    !(significantDigits > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, significantDigits + " is not positive.") : invariant(false) : void 0;
    Decimal.set({
      precision: significantDigits + 1,
      rounding: toSignificantRounding[rounding]
    });
    var quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    if (rounding === void 0) {
      rounding = Rounding.ROUND_HALF_UP;
    }

    !Number.isInteger(decimalPlaces) ? process.env.NODE_ENV !== "production" ? invariant(false, decimalPlaces + " is not an integer.") : invariant(false) : void 0;
    !(decimalPlaces >= 0) ? process.env.NODE_ENV !== "production" ? invariant(false, decimalPlaces + " is negative.") : invariant(false) : void 0;
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  };

  _createClass(Fraction, [{
    key: "quotient",
    get: function get() {
      return JSBI.divide(this.numerator, this.denominator);
    } // remainder after floor division

  }, {
    key: "remainder",
    get: function get() {
      return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator);
    }
  }]);

  return Fraction;
}();

var Big$1 = /*#__PURE__*/toFormat(_Big);
var TokenAmount = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose(TokenAmount, _Fraction);

  // amount _must_ be raw, i.e. in the native representation
  function TokenAmount(token, amount) {
    var _this;

    var parsedAmount = parseBigintIsh(amount);
    validateSolidityTypeInstance(parsedAmount, SolidityType.uint256);
    _this = _Fraction.call(this, parsedAmount, JSBI.exponentiate(TEN, JSBI.BigInt(token.decimals))) || this;
    _this.token = token;
    return _this;
  }

  var _proto = TokenAmount.prototype;

  _proto.add = function add(other) {
    !this.token.equals(other.token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    return new TokenAmount(this.token, JSBI.add(this.raw, other.raw));
  };

  _proto.subtract = function subtract(other) {
    !this.token.equals(other.token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    return new TokenAmount(this.token, JSBI.subtract(this.raw, other.raw));
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }

    if (rounding === void 0) {
      rounding = Rounding.ROUND_DOWN;
    }

    return _Fraction.prototype.toSignificant.call(this, significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = this.token.decimals;
    }

    if (rounding === void 0) {
      rounding = Rounding.ROUND_DOWN;
    }

    !(decimalPlaces <= this.token.decimals) ? process.env.NODE_ENV !== "production" ? invariant(false, 'DECIMALS') : invariant(false) : void 0;
    return _Fraction.prototype.toFixed.call(this, decimalPlaces, format, rounding);
  };

  _proto.toExact = function toExact(format) {
    if (format === void 0) {
      format = {
        groupSeparator: ''
      };
    }

    Big$1.DP = this.token.decimals;
    return new Big$1(this.numerator.toString()).div(this.denominator.toString()).toFormat(format);
  };

  _createClass(TokenAmount, [{
    key: "raw",
    get: function get() {
      return this.numerator;
    }
  }]);

  return TokenAmount;
}(Fraction);

var CACHE$1 = {};
var Pair = /*#__PURE__*/function () {
  function Pair(tokenAmountA, tokenAmountB) {
    !(tokenAmountA.token.chainId === tokenAmountB.token.chainId) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_ID') : invariant(false) : void 0;
    var tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    this.liquidityToken = new Token(tokenAmounts[0].token.chainId, Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token), 18, 'DXS', 'DXswap');
    this.swapFee = new Contract(this.liquidityToken.address, IDXswapPair.abi, getDefaultProvider(getNetwork(tokenAmountA.token.chainId))).swapFee()["catch"](function () {
      return _30;
    });
    this.protocolFeeDenominator = new Contract(FACTORY_ADDRESS[tokenAmountA.token.chainId], IDXswapFactory.abi, getDefaultProvider(getNetwork(tokenAmountA.token.chainId))).protocolFeeDenominator()["catch"](function () {
      return FIVE;
    });
    this.tokenAmounts = tokenAmounts;
  }

  Pair.getAddress = function getAddress(tokenA, tokenB) {
    var _CACHE, _CACHE$tokens$0$addre;

    var tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks

    if (((_CACHE = CACHE$1) === null || _CACHE === void 0 ? void 0 : (_CACHE$tokens$0$addre = _CACHE[tokens[0].address]) === null || _CACHE$tokens$0$addre === void 0 ? void 0 : _CACHE$tokens$0$addre[tokens[1].address]) === undefined) {
      var _CACHE2, _extends2, _extends3;

      CACHE$1 = _extends(_extends({}, CACHE$1), {}, (_extends3 = {}, _extends3[tokens[0].address] = _extends(_extends({}, (_CACHE2 = CACHE$1) === null || _CACHE2 === void 0 ? void 0 : _CACHE2[tokens[0].address]), {}, (_extends2 = {}, _extends2[tokens[1].address] = getCreate2Address(FACTORY_ADDRESS[tokenA.chainId], keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]), INIT_CODE_HASH), _extends2)), _extends3));
    }

    return CACHE$1[tokens[0].address][tokens[1].address];
  };

  Pair.fetchData = function fetchData(tokenA, tokenB, provider) {
    try {
      if (provider === undefined) provider = getDefaultProvider(getNetwork(tokenA.chainId));
      !(tokenA.chainId === tokenB.chainId) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_ID') : invariant(false) : void 0;
      var address = Pair.getAddress(tokenA, tokenB);
      return Promise.resolve(new Contract(address, IDXswapPair.abi, provider).getReserves()).then(function (_ref) {
        var reserves0 = _ref[0],
            reserves1 = _ref[1];
        var balances = tokenA.sortsBefore(tokenB) ? [reserves0, reserves1] : [reserves1, reserves0];
        return new Pair(new TokenAmount(tokenA, balances[0]), new TokenAmount(tokenB, balances[1]));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var _proto = Pair.prototype;

  _proto.reserveOf = function reserveOf(token) {
    !(token.equals(this.token0) || token.equals(this.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  };

  _proto.getOutputAmount = function getOutputAmount(inputAmount) {
    try {
      var _this2 = this;

      !(inputAmount.token.equals(_this2.token0) || inputAmount.token.equals(_this2.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;

      if (JSBI.equal(_this2.reserve0.raw, ZERO) || JSBI.equal(_this2.reserve1.raw, ZERO)) {
        throw new InsufficientReservesError();
      }

      var inputReserve = _this2.reserveOf(inputAmount.token);

      var outputReserve = _this2.reserveOf(inputAmount.token.equals(_this2.token0) ? _this2.token1 : _this2.token0);

      var _multiply2 = JSBI.multiply,
          _inputAmount$raw2 = inputAmount.raw,
          _subtract2 = JSBI.subtract;
      return Promise.resolve(_this2.swapFee).then(function (_this$swapFee) {
        var inputAmountWithFee = _multiply2.call(JSBI, _inputAmount$raw2, _subtract2.call(JSBI, _10000, parseBigintIsh(_this$swapFee)));

        var numerator = JSBI.multiply(inputAmountWithFee, outputReserve.raw);
        var denominator = JSBI.add(JSBI.multiply(inputReserve.raw, _10000), inputAmountWithFee);
        var outputAmount = new TokenAmount(inputAmount.token.equals(_this2.token0) ? _this2.token1 : _this2.token0, JSBI.divide(numerator, denominator));

        if (JSBI.equal(outputAmount.raw, ZERO)) {
          throw new InsufficientInputAmountError();
        }

        return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getInputAmount = function getInputAmount(outputAmount) {
    try {
      var _this4 = this;

      !(outputAmount.token.equals(_this4.token0) || outputAmount.token.equals(_this4.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;

      if (JSBI.equal(_this4.reserve0.raw, ZERO) || JSBI.equal(_this4.reserve1.raw, ZERO) || JSBI.greaterThanOrEqual(outputAmount.raw, _this4.reserveOf(outputAmount.token).raw)) {
        throw new InsufficientReservesError();
      }

      var outputReserve = _this4.reserveOf(outputAmount.token);

      var inputReserve = _this4.reserveOf(outputAmount.token.equals(_this4.token0) ? _this4.token1 : _this4.token0);

      var numerator = JSBI.multiply(JSBI.multiply(inputReserve.raw, outputAmount.raw), _10000);

      var _multiply4 = JSBI.multiply,
          _JSBI$subtract2 = JSBI.subtract(outputReserve.raw, outputAmount.raw),
          _subtract4 = JSBI.subtract;

      return Promise.resolve(_this4.swapFee).then(function (_this3$swapFee) {
        var denominator = _multiply4.call(JSBI, _JSBI$subtract2, _subtract4.call(JSBI, _10000, parseBigintIsh(_this3$swapFee)));

        var inputAmount = new TokenAmount(outputAmount.token.equals(_this4.token0) ? _this4.token1 : _this4.token0, JSBI.add(JSBI.divide(numerator, denominator), ONE));
        return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getLiquidityMinted = function getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    !totalSupply.token.equals(this.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
    var tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    !(tokenAmounts[0].token.equals(this.token0) && tokenAmounts[1].token.equals(this.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    var liquidity;

    if (JSBI.equal(totalSupply.raw, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].raw, tokenAmounts[1].raw)), MINIMUM_LIQUIDITY);
    } else {
      var amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].raw, totalSupply.raw), this.reserve0.raw);
      var amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].raw, totalSupply.raw), this.reserve1.raw);
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }

    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError();
    }

    return new TokenAmount(this.liquidityToken, liquidity);
  };

  _proto.getLiquidityValue = function getLiquidityValue(token, totalSupply, liquidity, feeOn, kLast) {
    if (feeOn === void 0) {
      feeOn = false;
    }

    try {
      var _temp5 = function _temp5() {
        return new TokenAmount(token, JSBI.divide(JSBI.multiply(liquidity.raw, _this6.reserveOf(token).raw), totalSupplyAdjusted.raw));
      };

      var _this6 = this;

      !(token.equals(_this6.token0) || token.equals(_this6.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
      !totalSupply.token.equals(_this6.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOTAL_SUPPLY') : invariant(false) : void 0;
      !liquidity.token.equals(_this6.liquidityToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
      !JSBI.lessThanOrEqual(liquidity.raw, totalSupply.raw) ? process.env.NODE_ENV !== "production" ? invariant(false, 'LIQUIDITY') : invariant(false) : void 0;
      var totalSupplyAdjusted;

      var _temp6 = function () {
        if (!feeOn) {
          totalSupplyAdjusted = totalSupply;
        } else {
          !!!kLast ? process.env.NODE_ENV !== "production" ? invariant(false, 'K_LAST') : invariant(false) : void 0;
          var kLastParsed = parseBigintIsh(kLast);

          var _temp7 = function () {
            if (!JSBI.equal(kLastParsed, ZERO)) {
              var rootK = sqrt(JSBI.multiply(_this6.reserve0.raw, _this6.reserve1.raw));
              var rootKLast = sqrt(kLastParsed);

              var _temp8 = function () {
                if (JSBI.greaterThan(rootK, rootKLast)) {
                  var numerator = JSBI.multiply(totalSupply.raw, JSBI.subtract(rootK, rootKLast));
                  var _add2 = JSBI.add,
                      _multiply6 = JSBI.multiply;
                  return Promise.resolve(_this6.protocolFeeDenominator).then(function (_this5$protocolFeeDen) {
                    var denominator = _add2.call(JSBI, _multiply6.call(JSBI, rootK, parseBigintIsh(_this5$protocolFeeDen)), rootKLast);

                    var feeLiquidity = JSBI.divide(numerator, denominator);
                    totalSupplyAdjusted = totalSupply.add(new TokenAmount(_this6.liquidityToken, feeLiquidity));
                  });
                } else {
                  totalSupplyAdjusted = totalSupply;
                }
              }();

              if (_temp8 && _temp8.then) return _temp8.then(function () {});
            } else {
              totalSupplyAdjusted = totalSupply;
            }
          }();

          if (_temp7 && _temp7.then) return _temp7.then(function () {});
        }
      }();

      return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(_temp5) : _temp5(_temp6));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _createClass(Pair, [{
    key: "token0",
    get: function get() {
      return this.tokenAmounts[0].token;
    }
  }, {
    key: "token1",
    get: function get() {
      return this.tokenAmounts[1].token;
    }
  }, {
    key: "reserve0",
    get: function get() {
      return this.tokenAmounts[0];
    }
  }, {
    key: "reserve1",
    get: function get() {
      return this.tokenAmounts[1];
    }
  }]);

  return Pair;
}();

var Price = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose(Price, _Fraction);

  // denominator and numerator _must_ be raw, i.e. in the native representation
  function Price(baseToken, quoteToken, denominator, numerator) {
    var _this;

    _this = _Fraction.call(this, numerator, denominator) || this;
    _this.baseToken = baseToken;
    _this.quoteToken = quoteToken;
    _this.scalar = new Fraction(JSBI.exponentiate(TEN, JSBI.BigInt(baseToken.decimals)), JSBI.exponentiate(TEN, JSBI.BigInt(quoteToken.decimals)));
    return _this;
  }

  Price.fromRoute = function fromRoute(route) {
    var prices = [];

    for (var _iterator = _createForOfIteratorHelperLoose(route.pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
          i = _step$value[0],
          pair = _step$value[1];
      prices.push(route.path[i].equals(pair.token0) ? new Price(pair.reserve0.token, pair.reserve1.token, pair.reserve0.raw, pair.reserve1.raw) : new Price(pair.reserve1.token, pair.reserve0.token, pair.reserve1.raw, pair.reserve0.raw));
    }

    return prices.slice(1).reduce(function (accumulator, currentValue) {
      return accumulator.multiply(currentValue);
    }, prices[0]);
  };

  var _proto = Price.prototype;

  _proto.invert = function invert() {
    return new Price(this.quoteToken, this.baseToken, this.numerator, this.denominator);
  };

  _proto.multiply = function multiply(other) {
    !this.quoteToken.equals(other.baseToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'BASE') : invariant(false) : void 0;

    var fraction = _Fraction.prototype.multiply.call(this, other);

    return new Price(this.baseToken, other.quoteToken, fraction.denominator, fraction.numerator);
  } // performs floor division on overflow
  ;

  _proto.quote = function quote(tokenAmount) {
    !tokenAmount.token.equals(this.baseToken) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
    return new TokenAmount(this.quoteToken, _Fraction.prototype.multiply.call(this, tokenAmount.raw).quotient);
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }

    return this.adjusted.toSignificant(significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 4;
    }

    return this.adjusted.toFixed(decimalPlaces, format, rounding);
  };

  _createClass(Price, [{
    key: "raw",
    get: function get() {
      return new Fraction(this.numerator, this.denominator);
    }
  }, {
    key: "adjusted",
    get: function get() {
      return _Fraction.prototype.multiply.call(this, this.scalar);
    }
  }]);

  return Price;
}(Fraction);

var Route = /*#__PURE__*/function () {
  function Route(pairs, input) {
    !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
    !pairs.map(function (pair) {
      return pair.token0.chainId === pairs[0].token0.chainId;
    }).every(function (x) {
      return x;
    }) ? process.env.NODE_ENV !== "production" ? invariant(false, 'CHAIN_IDS') : invariant(false) : void 0;
    var path = [input];

    for (var _iterator = _createForOfIteratorHelperLoose(pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
          i = _step$value[0],
          pair = _step$value[1];
      var currentInput = path[i];
      !(currentInput.equals(pair.token0) || currentInput.equals(pair.token1)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PATH') : invariant(false) : void 0;
      var output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
      path.push(output);
    }

    !(path.length === new Set(path).size) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PATH') : invariant(false) : void 0;
    this.pairs = pairs;
    this.path = path;
    this.midPrice = Price.fromRoute(this);
  }

  _createClass(Route, [{
    key: "input",
    get: function get() {
      return this.path[0];
    }
  }, {
    key: "output",
    get: function get() {
      return this.path[this.path.length - 1];
    }
  }]);

  return Route;
}();

// A type of promise-like that resolves synchronously and supports only one observer
const _Pact = /*#__PURE__*/(function() {
	function _Pact() {}
	_Pact.prototype.then = function(onFulfilled, onRejected) {
		const result = new _Pact();
		const state = this.s;
		if (state) {
			const callback = state & 1 ? onFulfilled : onRejected;
			if (callback) {
				try {
					_settle(result, 1, callback(this.v));
				} catch (e) {
					_settle(result, 2, e);
				}
				return result;
			} else {
				return this;
			}
		}
		this.o = function(_this) {
			try {
				const value = _this.v;
				if (_this.s & 1) {
					_settle(result, 1, onFulfilled ? onFulfilled(value) : value);
				} else if (onRejected) {
					_settle(result, 1, onRejected(value));
				} else {
					_settle(result, 2, value);
				}
			} catch (e) {
				_settle(result, 2, e);
			}
		};
		return result;
	};
	return _Pact;
})();

// Settles a pact synchronously
function _settle(pact, state, value) {
	if (!pact.s) {
		if (value instanceof _Pact) {
			if (value.s) {
				if (state & 1) {
					state = value.s;
				}
				value = value.v;
			} else {
				value.o = _settle.bind(null, pact, state);
				return;
			}
		}
		if (value && value.then) {
			value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
			return;
		}
		pact.s = state;
		pact.v = value;
		const observer = pact.o;
		if (observer) {
			observer(pact);
		}
	}
}

function _isSettledPact(thenable) {
	return thenable instanceof _Pact && thenable.s & 1;
}

// Asynchronously iterate through an object that has a length property, passing the index as the first argument to the callback (even as the length property changes)
function _forTo(array, body, check) {
	var i = -1, pact, reject;
	function _cycle(result) {
		try {
			while (++i < array.length && (!check || !check())) {
				result = body(i);
				if (result && result.then) {
					if (_isSettledPact(result)) {
						result = result.v;
					} else {
						result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
						return;
					}
				}
			}
			if (pact) {
				_settle(pact, 1, result);
			} else {
				pact = result;
			}
		} catch (e) {
			_settle(pact || (pact = new _Pact()), 2, e);
		}
	}
	_cycle();
	return pact;
}

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously implement a generic for loop
function _for(test, update, body) {
	var stage;
	for (;;) {
		var shouldContinue = test();
		if (_isSettledPact(shouldContinue)) {
			shouldContinue = shouldContinue.v;
		}
		if (!shouldContinue) {
			return result;
		}
		if (shouldContinue.then) {
			stage = 0;
			break;
		}
		var result = body();
		if (result && result.then) {
			if (_isSettledPact(result)) {
				result = result.s;
			} else {
				stage = 1;
				break;
			}
		}
		if (update) {
			var updateValue = update();
			if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
				stage = 2;
				break;
			}
		}
	}
	var pact = new _Pact();
	var reject = _settle.bind(null, pact, 2);
	(stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
	return pact;
	function _resumeAfterBody(value) {
		result = value;
		do {
			if (update) {
				updateValue = update();
				if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
					updateValue.then(_resumeAfterUpdate).then(void 0, reject);
					return;
				}
			}
			shouldContinue = test();
			if (!shouldContinue || (_isSettledPact(shouldContinue) && !shouldContinue.v)) {
				_settle(pact, 1, result);
				return;
			}
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
				return;
			}
			result = body();
			if (_isSettledPact(result)) {
				result = result.v;
			}
		} while (!result || !result.then);
		result.then(_resumeAfterBody).then(void 0, reject);
	}
	function _resumeAfterTest(shouldContinue) {
		if (shouldContinue) {
			result = body();
			if (result && result.then) {
				result.then(_resumeAfterBody).then(void 0, reject);
			} else {
				_resumeAfterBody(result);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
	function _resumeAfterUpdate() {
		if (shouldContinue = test()) {
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
			} else {
				_resumeAfterTest(shouldContinue);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
}

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

var _100_PERCENT = /*#__PURE__*/new Fraction(_100);

var Percent = /*#__PURE__*/function (_Fraction) {
  _inheritsLoose(Percent, _Fraction);

  function Percent() {
    return _Fraction.apply(this, arguments) || this;
  }

  var _proto = Percent.prototype;

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 5;
    }

    return this.multiply(_100_PERCENT).toSignificant(significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = 2;
    }

    return this.multiply(_100_PERCENT).toFixed(decimalPlaces, format, rounding);
  };

  return Percent;
}(Fraction);

function getSlippage(midPrice, inputAmount, outputAmount) {
  var exactQuote = midPrice.raw.multiply(inputAmount.raw); // calculate slippage := (exactQuote - outputAmount) / exactQuote

  var slippage = exactQuote.subtract(outputAmount.raw).divide(exactQuote);
  return new Percent(slippage.numerator, slippage.denominator);
} // comparator function that allows sorting trades by their output amounts, in decreasing order, and then input amounts
// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first


function inputOutputComparator(a, b) {
  // must have same input and output token for comparison
  !(a.inputAmount !== undefined && a.outputAmount !== undefined) ? process.env.NODE_ENV !== "production" ? invariant(false, 'UNDEFINED_A') : invariant(false) : void 0;
  !(b.inputAmount !== undefined && b.outputAmount !== undefined) ? process.env.NODE_ENV !== "production" ? invariant(false, 'UNDEFINED_B') : invariant(false) : void 0;
  !a.inputAmount.token.equals(b.inputAmount.token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INPUT_TOKEN') : invariant(false) : void 0;
  !a.outputAmount.token.equals(b.outputAmount.token) ? process.env.NODE_ENV !== "production" ? invariant(false, 'OUTPUT_TOKEN') : invariant(false) : void 0;

  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0;
    } // trade A requires less input than trade B, so A should come first


    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1;
    } else {
      return 1;
    }
  } else {
    // tradeA has less output than trade B, so should come second
    if (a.outputAmount.lessThan(b.outputAmount)) {
      return 1;
    } else {
      return -1;
    }
  }
} // extension of the input output comparator that also considers other dimensions of the trade in ranking them

function tradeComparator(a, b) {
  !(a.slippage !== undefined && b.slippage !== undefined) ? process.env.NODE_ENV !== "production" ? invariant(false, 'UNDEFINED_NULL') : invariant(false) : void 0;
  !(a.route !== undefined && b.route !== undefined) ? process.env.NODE_ENV !== "production" ? invariant(false, 'UNDEFINED_NULL') : invariant(false) : void 0;
  var ioComp = inputOutputComparator(a, b);

  if (ioComp !== 0) {
    return ioComp;
  } // consider lowest slippage next, since these are less likely to fail


  if (a.slippage.lessThan(b.slippage)) {
    return -1;
  } else if (a.slippage.greaterThan(b.slippage)) {
    return 1;
  } // finally consider the number of hops since each hop costs gas


  return a.route.path.length - b.route.path.length;
}
var Trade = /*#__PURE__*/function () {
  function Trade() {
    this.create = function (route, amount, tradeType) {
      try {
        var _temp5 = function _temp5() {
          trade.route = route;
          trade.tradeType = tradeType;
          var inputAmount = amounts[0];
          var outputAmount = amounts[amounts.length - 1];
          trade.inputAmount = inputAmount;
          trade.outputAmount = outputAmount;
          trade.executionPrice = new Price(route.input, route.output, inputAmount.raw, outputAmount.raw);
          trade.nextMidPrice = Price.fromRoute(new Route(nextPairs, route.input));
          trade.slippage = getSlippage(route.midPrice, inputAmount, outputAmount);
          return trade;
        };

        !amount.token.equals(tradeType === TradeType.EXACT_INPUT ? route.input : route.output) ? process.env.NODE_ENV !== "production" ? invariant(false, 'TOKEN') : invariant(false) : void 0;
        var trade = new Trade();
        trade.route = route;
        trade.tradeType = tradeType;
        trade.amount = amount;
        var amounts = new Array(route.path.length);
        var nextPairs = new Array(route.pairs.length);

        var _temp6 = function () {
          if (tradeType === TradeType.EXACT_INPUT) {
            amounts[0] = trade.amount;
            var _i = 0;

            var _temp7 = _for(function () {
              return _i < route.path.length - 1;
            }, function () {
              return _i++;
            }, function () {
              var pair = route.pairs[_i];
              return Promise.resolve(pair.getOutputAmount(amounts[_i])).then(function (_ref) {
                var outputAmount = _ref[0],
                    nextPair = _ref[1];
                amounts[_i + 1] = outputAmount;
                nextPairs[_i] = nextPair;
              });
            });

            if (_temp7 && _temp7.then) return _temp7.then(function () {});
          } else {
            amounts[amounts.length - 1] = trade.amount;

            var _i2 = route.path.length - 1;

            var _temp8 = _for(function () {
              return _i2 > 0;
            }, function () {
              return _i2--;
            }, function () {
              var pair = route.pairs[_i2 - 1];
              return Promise.resolve(pair.getInputAmount(amounts[_i2])).then(function (_ref2) {
                var inputAmount = _ref2[0],
                    nextPair = _ref2[1];
                amounts[_i2 - 1] = inputAmount;
                nextPairs[_i2 - 1] = nextPair;
              });
            });

            if (_temp8 && _temp8.then) return _temp8.then(function () {});
          }
        }();

        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(_temp5) : _temp5(_temp6));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  } // get the minimum amount that must be received from this trade for the given slippage tolerance


  var _proto = Trade.prototype;

  _proto.minimumAmountOut = function minimumAmountOut(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ? process.env.NODE_ENV !== "production" ? invariant(false, 'SLIPPAGE_TOLERANCE') : invariant(false) : void 0;
    !(this.outputAmount !== undefined) ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0;

    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount;
    } else {
      return new TokenAmount(this.outputAmount.token, new Fraction(ONE).add(slippageTolerance).invert().multiply(this.outputAmount.raw).quotient);
    }
  } // get the maximum amount in that can be spent via this trade for the given slippage tolerance
  ;

  _proto.maximumAmountIn = function maximumAmountIn(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ? process.env.NODE_ENV !== "production" ? invariant(false, 'SLIPPAGE_TOLERANCE') : invariant(false) : void 0;
    !(this.inputAmount !== undefined) ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0;

    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount;
    } else {
      return new TokenAmount(this.inputAmount.token, new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.raw).quotient);
    }
  } // given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
  // amount to an output token, making at most `maxHops` hops
  // note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
  // the amount in among multiple routes.
  ;

  Trade.bestTradeExactIn = function bestTradeExactIn(pairs, amountIn, tokenOut, _temp14, // used in recursion.
  currentPairs, originalAmountIn, bestTrades) {
    var _ref3 = _temp14 === void 0 ? {} : _temp14,
        _ref3$maxNumResults = _ref3.maxNumResults,
        maxNumResults = _ref3$maxNumResults === void 0 ? 3 : _ref3$maxNumResults,
        _ref3$maxHops = _ref3.maxHops,
        maxHops = _ref3$maxHops === void 0 ? 3 : _ref3$maxHops;

    if (currentPairs === void 0) {
      currentPairs = [];
    }

    if (originalAmountIn === void 0) {
      originalAmountIn = amountIn;
    }

    if (bestTrades === void 0) {
      bestTrades = [];
    }

    try {
      var _exit2 = false;
      !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
      !(maxHops > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_HOPS') : invariant(false) : void 0;
      !(originalAmountIn === amountIn || currentPairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_RECURSION') : invariant(false) : void 0;

      var _temp15 = _forTo(pairs, function (i) {
        function _temp12(_result) {
          if (_exit2) return _result;

          var _temp10 = function () {
            if (amountOut.token.equals(tokenOut)) {
              return Promise.resolve(new Trade().create(new Route([].concat(currentPairs, [pair]), originalAmountIn.token), originalAmountIn, TradeType.EXACT_INPUT)).then(function (_Trade$create) {
                sortedInsert(bestTrades, _Trade$create, maxNumResults, tradeComparator);
              });
            } else {
              var _temp16 = function () {
                if (maxHops > 1 && pairs.length > 1) {
                  var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops

                  return Promise.resolve(Trade.bestTradeExactIn(pairsExcludingThisPair, amountOut, tokenOut, {
                    maxNumResults: maxNumResults,
                    maxHops: maxHops - 1
                  }, [].concat(currentPairs, [pair]), originalAmountIn, bestTrades)).then(function () {});
                }
              }();

              if (_temp16 && _temp16.then) return _temp16.then(function () {});
            }
          }();

          if (_temp10 && _temp10.then) return _temp10.then(function () {});
        }

        var pair = pairs[i]; // pair irrelevant

        if (!pair.token0.equals(amountIn.token) && !pair.token1.equals(amountIn.token)) return;
        if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) return;
        var amountOut;

        var _temp11 = _catch(function () {
          ;
          return Promise.resolve(pair.getOutputAmount(amountIn)).then(function (_pair$getOutputAmount) {
            amountOut = _pair$getOutputAmount[0];
          });
        }, function (error) {
          // input too low
          if (error.isInsufficientInputAmountError) {
            return;
          }

          throw error;
        });

        return _temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11); // we have arrived at the output token, so this is the final trade of one of the paths
      }, function () {
        return _exit2;
      });

      return Promise.resolve(_temp15 && _temp15.then ? _temp15.then(function (_result2) {
        return _exit2 ? _result2 : bestTrades;
      }) : _exit2 ? _temp15 : bestTrades);
    } catch (e) {
      return Promise.reject(e);
    }
  } // similar to the above method but instead targets a fixed output amount
  // given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
  // to an output token amount, making at most `maxHops` hops
  // note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
  // the amount in among multiple routes.
  ;

  Trade.bestTradeExactOut = function bestTradeExactOut(pairs, tokenIn, amountOut, _temp22, // used in recursion.
  currentPairs, originalAmountOut, bestTrades) {
    var _ref4 = _temp22 === void 0 ? {} : _temp22,
        _ref4$maxNumResults = _ref4.maxNumResults,
        maxNumResults = _ref4$maxNumResults === void 0 ? 3 : _ref4$maxNumResults,
        _ref4$maxHops = _ref4.maxHops,
        maxHops = _ref4$maxHops === void 0 ? 3 : _ref4$maxHops;

    if (currentPairs === void 0) {
      currentPairs = [];
    }

    if (originalAmountOut === void 0) {
      originalAmountOut = amountOut;
    }

    if (bestTrades === void 0) {
      bestTrades = [];
    }

    try {
      var _exit4 = false;
      !(pairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'PAIRS') : invariant(false) : void 0;
      !(maxHops > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MAX_HOPS') : invariant(false) : void 0;
      !(originalAmountOut === amountOut || currentPairs.length > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'INVALID_RECURSION') : invariant(false) : void 0;

      var _temp23 = _forTo(pairs, function (i) {
        function _temp20(_result3) {
          if (_exit4) return _result3;

          var _temp18 = function () {
            if (amountIn.token.equals(tokenIn)) {
              return Promise.resolve(new Trade().create(new Route([pair].concat(currentPairs), tokenIn), originalAmountOut, TradeType.EXACT_OUTPUT)).then(function (_Trade$create2) {
                sortedInsert(bestTrades, _Trade$create2, maxNumResults, tradeComparator);
              });
            } else {
              var _temp24 = function () {
                if (maxHops > 1 && pairs.length > 1) {
                  var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops

                  return Promise.resolve(Trade.bestTradeExactOut(pairsExcludingThisPair, tokenIn, amountIn, {
                    maxNumResults: maxNumResults,
                    maxHops: maxHops - 1
                  }, [pair].concat(currentPairs), originalAmountOut, bestTrades)).then(function () {});
                }
              }();

              if (_temp24 && _temp24.then) return _temp24.then(function () {});
            }
          }();

          if (_temp18 && _temp18.then) return _temp18.then(function () {});
        }

        var pair = pairs[i]; // pair irrelevant

        if (!pair.token0.equals(amountOut.token) && !pair.token1.equals(amountOut.token)) return;
        if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) return;
        var amountIn;

        var _temp19 = _catch(function () {
          ;
          return Promise.resolve(pair.getInputAmount(amountOut)).then(function (_pair$getInputAmount) {
            amountIn = _pair$getInputAmount[0];
          });
        }, function (error) {
          // not enough liquidity in this pair
          if (error.isInsufficientReservesError) {
            return;
          }

          throw error;
        });

        return _temp19 && _temp19.then ? _temp19.then(_temp20) : _temp20(_temp19); // we have arrived at the input token, so this is the first trade of one of the paths
      }, function () {
        return _exit4;
      });

      return Promise.resolve(_temp23 && _temp23.then ? _temp23.then(function (_result4) {
        return _exit4 ? _result4 : bestTrades;
      }) : _exit4 ? _temp23 : bestTrades);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return Trade;
}();

export { ChainId, FACTORY_ADDRESS, Fraction, INIT_CODE_HASH, InsufficientInputAmountError, InsufficientReservesError, MINIMUM_LIQUIDITY, Pair, Percent, Price, Rounding, Route, Token, TokenAmount, Trade, TradeType, WETH, inputOutputComparator, tradeComparator };
//# sourceMappingURL=dxswap-sdk.esm.js.map
