'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var JSBI = _interopDefault(require('jsbi'));
var kovan_json = require('dxswap-core/.openzeppelin/kovan.json');
var invariant = _interopDefault(require('tiny-invariant'));
var warning = _interopDefault(require('tiny-warning'));
var address = require('@ethersproject/address');
var networks = require('@ethersproject/networks');
var providers = require('@ethersproject/providers');
var contracts = require('@ethersproject/contracts');
var IDXswapPair = _interopDefault(require('dxswap-core/build/contracts/IDXswapPair.json'));
var IDXswapFactory = _interopDefault(require('dxswap-core/build/contracts/IDXswapFactory.json'));
var solidity = require('@ethersproject/solidity');
var _Big = _interopDefault(require('big.js'));
var toFormat = _interopDefault(require('toformat'));
var _Decimal = _interopDefault(require('decimal.js-light'));

var MULTICALL_ABI = [
	{
		constant: true,
		inputs: [
		],
		name: "getCurrentBlockTimestamp",
		outputs: [
			{
				name: "timestamp",
				type: "uint256"
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
				components: [
					{
						name: "target",
						type: "address"
					},
					{
						name: "callData",
						type: "bytes"
					}
				],
				name: "calls",
				type: "tuple[]"
			}
		],
		name: "aggregate",
		outputs: [
			{
				name: "blockNumber",
				type: "uint256"
			},
			{
				name: "returnData",
				type: "bytes[]"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "getLastBlockHash",
		outputs: [
			{
				name: "blockHash",
				type: "bytes32"
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
				name: "addr",
				type: "address"
			}
		],
		name: "getEthBalance",
		outputs: [
			{
				name: "balance",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "getCurrentBlockDifficulty",
		outputs: [
			{
				name: "difficulty",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "getCurrentBlockGasLimit",
		outputs: [
			{
				name: "gaslimit",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "getCurrentBlockCoinbase",
		outputs: [
			{
				name: "coinbase",
				type: "address"
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
				name: "blockNumber",
				type: "uint256"
			}
		],
		name: "getBlockHash",
		outputs: [
			{
				name: "blockHash",
				type: "bytes32"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	}
];

var _FACTORY_ADDRESS, _SOLIDITY_TYPE_MAXIMA, _MULTICALL_ADDRESS;

(function (ChainId) {
  ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
  ChainId[ChainId["ROPSTEN"] = 3] = "ROPSTEN";
  ChainId[ChainId["RINKEBY"] = 4] = "RINKEBY";
  ChainId[ChainId["G\xD6RLI"] = 5] = "G\xD6RLI";
  ChainId[ChainId["KOVAN"] = 42] = "KOVAN";
})(exports.ChainId || (exports.ChainId = {}));

(function (TradeType) {
  TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(exports.TradeType || (exports.TradeType = {}));

(function (Rounding) {
  Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(exports.Rounding || (exports.Rounding = {}));
var FACTORY_ADDRESS = (_FACTORY_ADDRESS = {}, _FACTORY_ADDRESS[exports.ChainId.MAINNET] = '0x0000000000000000000000000000000000000001', _FACTORY_ADDRESS[exports.ChainId.ROPSTEN] = '0x0000000000000000000000000000000000000003', _FACTORY_ADDRESS[exports.ChainId.RINKEBY] = '0x0000000000000000000000000000000000000004', _FACTORY_ADDRESS[exports.ChainId.GÖRLI] = '0x0000000000000000000000000000000000000005', _FACTORY_ADDRESS[exports.ChainId.KOVAN] = kovan_json.proxies['dxswap-core/DXswapFactory'][0].address, _FACTORY_ADDRESS);
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
var defaultSwapFee = _30;
var defaultProtocolFeeDenominator = FIVE;
var SolidityType;

(function (SolidityType) {
  SolidityType["uint8"] = "uint8";
  SolidityType["uint256"] = "uint256";
})(SolidityType || (SolidityType = {}));

var SOLIDITY_TYPE_MAXIMA = (_SOLIDITY_TYPE_MAXIMA = {}, _SOLIDITY_TYPE_MAXIMA[SolidityType.uint8] = /*#__PURE__*/JSBI.BigInt('0xff'), _SOLIDITY_TYPE_MAXIMA[SolidityType.uint256] = /*#__PURE__*/JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), _SOLIDITY_TYPE_MAXIMA);
var MULTICALL_ADDRESS = (_MULTICALL_ADDRESS = {}, _MULTICALL_ADDRESS[exports.ChainId.MAINNET] = '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441', _MULTICALL_ADDRESS[exports.ChainId.ROPSTEN] = '0x53C43764255c17BD724F74c4eF150724AC50a3ed', _MULTICALL_ADDRESS[exports.ChainId.KOVAN] = '0x2cc8688C5f75E365aaEEb4ea8D6a480405A48D2A', _MULTICALL_ADDRESS[exports.ChainId.RINKEBY] = '0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821', _MULTICALL_ADDRESS[exports.ChainId.GÖRLI] = '0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e', _MULTICALL_ADDRESS);

function validateSolidityTypeInstance(value, solidityType) {
  !JSBI.greaterThanOrEqual(value, ZERO) ?  invariant(false, value + " is not a " + solidityType + ".")  : void 0;
  !JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]) ?  invariant(false, value + " is not a " + solidityType + ".")  : void 0;
} // warns if addresses are not checksummed

function validateAndParseAddress(address$1) {
  try {
    var checksummedAddress = address.getAddress(address$1);
    "development" !== "production" ? warning(address$1 === checksummedAddress, address$1 + " is not checksummed.") : void 0;
    return checksummedAddress;
  } catch (error) {
      invariant(false, address$1 + " is not a valid address.")  ;
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
  !(maxSize > 0) ?  invariant(false, 'MAX_SIZE_ZERO')  : void 0; // this is an invariant because the interface cannot return multiple removed items if items.length exceeds maxSize

  !(items.length <= maxSize) ?  invariant(false, 'ITEMS_SIZE')  : void 0; // short circuit first item add

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

var _CACHE, _WETH, _DXD, _WEENUS, _XEENUS, _YEENUS;
var CACHE = (_CACHE = {}, _CACHE[exports.ChainId.MAINNET] = {
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

      if (provider === undefined) provider = providers.getDefaultProvider(networks.getNetwork(chainId));

      var _temp4 = typeof ((_CACHE2 = CACHE) === null || _CACHE2 === void 0 ? void 0 : (_CACHE2$chainId = _CACHE2[chainId]) === null || _CACHE2$chainId === void 0 ? void 0 : _CACHE2$chainId[address]) === 'number';

      return Promise.resolve(_temp4 ? _temp3(CACHE[chainId][address]) : Promise.resolve(new contracts.Contract(address, ERC20, provider).decimals().then(function (decimals) {
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
      !(this.decimals === other.decimals) ?  invariant(false, 'DECIMALS')  : void 0;
      if (this.symbol && other.symbol) !(this.symbol === other.symbol) ?  invariant(false, 'SYMBOL')  : void 0;
      if (this.name && other.name) !(this.name === other.name) ?  invariant(false, 'NAME')  : void 0;
    }

    return equal;
  };

  _proto.sortsBefore = function sortsBefore(other) {
    !(this.chainId === other.chainId) ?  invariant(false, 'CHAIN_IDS')  : void 0;
    !(this.address !== other.address) ?  invariant(false, 'ADDRESSES')  : void 0;
    return this.address.toLowerCase() < other.address.toLowerCase();
  };

  return Token;
}();
var WETH = (_WETH = {}, _WETH[exports.ChainId.MAINNET] = /*#__PURE__*/new Token(exports.ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.ROPSTEN] = /*#__PURE__*/new Token(exports.ChainId.ROPSTEN, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.RINKEBY] = /*#__PURE__*/new Token(exports.ChainId.RINKEBY, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.GÖRLI] = /*#__PURE__*/new Token(exports.ChainId.GÖRLI, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'), _WETH[exports.ChainId.KOVAN] = /*#__PURE__*/new Token(exports.ChainId.KOVAN, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'), _WETH);
var DXD = (_DXD = {}, _DXD[exports.ChainId.MAINNET] = /*#__PURE__*/new Token(exports.ChainId.MAINNET, '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521', 18, 'DXD', 'DXDao'), _DXD[exports.ChainId.KOVAN] = /*#__PURE__*/new Token(exports.ChainId.KOVAN, '0xDd25BaE0659fC06a8d00CD06C7f5A98D71bfB715', 18, 'DXD', 'DXDao'), _DXD);
var TEST_TOKENS = {
  WEENUS: (_WEENUS = {}, _WEENUS[exports.ChainId.MAINNET] = /*#__PURE__*/new Token(exports.ChainId.MAINNET, '0x2823589Ae095D99bD64dEeA80B4690313e2fB519', 18, 'WEENUS', 'Weenus'), _WEENUS[exports.ChainId.KOVAN] = /*#__PURE__*/new Token(exports.ChainId.KOVAN, '0xaFF4481D10270F50f203E0763e2597776068CBc5', 18, 'WEENUS', 'Weenus'), _WEENUS),
  XEENUS: (_XEENUS = {}, _XEENUS[exports.ChainId.MAINNET] = /*#__PURE__*/new Token(exports.ChainId.MAINNET, '0xeEf5E2d8255E973d587217f9509B416b41CA5870', 18, 'XEENUS', 'Xeenus'), _XEENUS[exports.ChainId.KOVAN] = /*#__PURE__*/new Token(exports.ChainId.KOVAN, '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c', 18, 'XEENUS', 'Xeenus'), _XEENUS),
  YEENUS: (_YEENUS = {}, _YEENUS[exports.ChainId.MAINNET] = /*#__PURE__*/new Token(exports.ChainId.MAINNET, '0x187E63F9eBA692A0ac98d3edE6fEb870AF0079e1', 8, 'YEENUS', 'Yeenus'), _YEENUS[exports.ChainId.KOVAN] = /*#__PURE__*/new Token(exports.ChainId.KOVAN, '0xc6fDe3FD2Cc2b173aEC24cc3f267cb3Cd78a26B7', 8, 'YEENUS', 'Yeenus'), _YEENUS)
};

var Fees = /*#__PURE__*/function () {
  function Fees() {}

  Fees.fetchSwapFee = function fetchSwapFee(tokenPair, provider) {
    try {
      if (provider === undefined) provider = providers.getDefaultProvider(networks.getNetwork(tokenPair.chainId));
      var _BigInt2 = JSBI.BigInt;
      return Promise.resolve(new contracts.Contract(tokenPair.address, IDXswapPair.abi, provider).swapFee()).then(function (_Contract$swapFee) {
        var _BigInt$call = _BigInt2.call(JSBI, _Contract$swapFee);

        return Promise.resolve(new contracts.Contract(FACTORY_ADDRESS[tokenPair.chainId], IDXswapFactory.abi, provider).feeToSetter()).then(function (_Contract$feeToSetter) {
          return {
            fee: _BigInt$call,
            owner: _Contract$feeToSetter
          };
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  Fees.fetchSwapFees = function fetchSwapFees(tokenPairs, provider) {
    try {
      if (provider === undefined) provider = providers.getDefaultProvider(networks.getNetwork(tokenPairs[0].chainId));
      var multicall = new contracts.Contract(MULTICALL_ADDRESS[tokenPairs[0].chainId], MULTICALL_ABI, provider);
      var factoryContract = new contracts.Contract(FACTORY_ADDRESS[tokenPairs[0].chainId], IDXswapFactory.abi, provider);
      var tokenPairContract = new contracts.Contract(tokenPairs[0].address, IDXswapPair.abi, provider);
      var calls = [];
      calls.push({
        address: factoryContract.address,
        callData: factoryContract["interface"].encodeFunctionData(factoryContract["interface"].getFunction('feeToSetter()'))
      });

      for (var tokenPairsIndex = 0; tokenPairsIndex < tokenPairs.length; tokenPairsIndex++) {
        calls.push({
          address: tokenPairs[tokenPairsIndex].address,
          callData: tokenPairContract["interface"].encodeFunctionData(tokenPairContract["interface"].getFunction('swapFee()'))
        });
      }

      return Promise.resolve(multicall.aggregate(calls.map(function (call) {
        return [call.address, call.callData];
      }))).then(function (result) {
        var owner = factoryContract["interface"].decodeFunctionResult(factoryContract["interface"].getFunction('feeToSetter()'), result.returnData[0])[0];
        var fees = [];

        for (var resultIndex = 1; resultIndex < result.returnData.length; resultIndex++) {
          fees.push({
            fee: JSBI.BigInt(tokenPairContract["interface"].decodeFunctionResult(tokenPairContract["interface"].getFunction('swapFee()'), result.returnData[resultIndex])[0]),
            owner: owner
          });
        }

        return fees;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  Fees.fetchAllSwapFees = function fetchAllSwapFees(chainId, swapFeesCache, provider) {
    if (swapFeesCache === void 0) {
      swapFeesCache = {};
    }

    try {
      var _this2 = this;

      if (provider === undefined) provider = providers.getDefaultProvider(networks.getNetwork(chainId));
      var multicall = new contracts.Contract(MULTICALL_ADDRESS[chainId], MULTICALL_ABI, provider);
      var factoryContract = new contracts.Contract(FACTORY_ADDRESS[chainId], IDXswapFactory.abi, provider);
      return Promise.resolve(factoryContract.allPairsLength()).then(function (allPairsLength) {
        var allSwapPairs = {}; // Get first token pairs from cache

        var tokenPairsCache = Object.keys(swapFeesCache);
        var tokenPairsToFetch = [];

        for (var tokenPaisCacheIndex = 0; tokenPaisCacheIndex < tokenPairsCache.length; tokenPaisCacheIndex++) {
          allSwapPairs[tokenPairsCache[tokenPaisCacheIndex]] = {
            fee: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].fee,
            owner: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].owner
          };
        } // Get rest of the token pairs that are not cached


        var calls = [];

        for (var pairIndex = tokenPairsCache.length; pairIndex < allPairsLength; pairIndex++) {
          calls.push({
            address: factoryContract.address,
            callData: factoryContract["interface"].encodeFunctionData(factoryContract["interface"].getFunction('allPairs(uint)'), [pairIndex])
          });
        }

        return Promise.resolve(multicall.aggregate(calls.map(function (call) {
          return [call.address, call.callData];
        }))).then(function (result) {
          for (var resultIndex = 0; resultIndex < result.returnData.length; resultIndex++) {
            var tokenPairAddress = factoryContract["interface"].decodeFunctionResult(factoryContract["interface"].getFunction('allPairs(uint256)'), result.returnData[resultIndex])[0];
            tokenPairsToFetch.push(new Token(chainId, tokenPairAddress, 18, 'DXS', 'DXswap'));
          } // Fetch the pairs that we dont have the fee and owner


          return Promise.resolve(_this2.fetchSwapFees(tokenPairsToFetch, provider)).then(function (swapFeesFetched) {
            for (var tokenPairsToFetchIndex = 0; tokenPairsToFetchIndex < tokenPairsToFetch.length; tokenPairsToFetchIndex++) {
              allSwapPairs[tokenPairsToFetch[tokenPairsToFetchIndex].address] = swapFeesFetched[tokenPairsToFetchIndex];
            }

            return allSwapPairs;
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  Fees.fetchProtocolFee = function fetchProtocolFee(chainId, provider) {
    try {
      if (provider === undefined) provider = providers.getDefaultProvider(networks.getNetwork(chainId));
      return Promise.resolve(new contracts.Contract(FACTORY_ADDRESS[chainId], IDXswapFactory.abi, provider)).then(function (factoryContract) {
        return Promise.resolve(factoryContract.protocolFeeDenominator()).then(function (feeDenominator) {
          return Promise.resolve(factoryContract.feeTo()).then(function (feeReceiver) {
            return {
              feeDenominator: feeDenominator,
              feeReceiver: feeReceiver
            };
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return Fees;
}();

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

var _toSignificantRoundin, _toFixedRounding;
var Decimal = /*#__PURE__*/toFormat(_Decimal);
var Big = /*#__PURE__*/toFormat(_Big);
var toSignificantRounding = (_toSignificantRoundin = {}, _toSignificantRoundin[exports.Rounding.ROUND_DOWN] = Decimal.ROUND_DOWN, _toSignificantRoundin[exports.Rounding.ROUND_HALF_UP] = Decimal.ROUND_HALF_UP, _toSignificantRoundin[exports.Rounding.ROUND_UP] = Decimal.ROUND_UP, _toSignificantRoundin);
var toFixedRounding = (_toFixedRounding = {}, _toFixedRounding[exports.Rounding.ROUND_DOWN] = 0, _toFixedRounding[exports.Rounding.ROUND_HALF_UP] = 1, _toFixedRounding[exports.Rounding.ROUND_UP] = 3, _toFixedRounding);
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
      rounding = exports.Rounding.ROUND_HALF_UP;
    }

    !Number.isInteger(significantDigits) ?  invariant(false, significantDigits + " is not an integer.")  : void 0;
    !(significantDigits > 0) ?  invariant(false, significantDigits + " is not positive.")  : void 0;
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
      rounding = exports.Rounding.ROUND_HALF_UP;
    }

    !Number.isInteger(decimalPlaces) ?  invariant(false, decimalPlaces + " is not an integer.")  : void 0;
    !(decimalPlaces >= 0) ?  invariant(false, decimalPlaces + " is negative.")  : void 0;
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
    !this.token.equals(other.token) ?  invariant(false, 'TOKEN')  : void 0;
    return new TokenAmount(this.token, JSBI.add(this.raw, other.raw));
  };

  _proto.subtract = function subtract(other) {
    !this.token.equals(other.token) ?  invariant(false, 'TOKEN')  : void 0;
    return new TokenAmount(this.token, JSBI.subtract(this.raw, other.raw));
  };

  _proto.toSignificant = function toSignificant(significantDigits, format, rounding) {
    if (significantDigits === void 0) {
      significantDigits = 6;
    }

    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_DOWN;
    }

    return _Fraction.prototype.toSignificant.call(this, significantDigits, format, rounding);
  };

  _proto.toFixed = function toFixed(decimalPlaces, format, rounding) {
    if (decimalPlaces === void 0) {
      decimalPlaces = this.token.decimals;
    }

    if (rounding === void 0) {
      rounding = exports.Rounding.ROUND_DOWN;
    }

    !(decimalPlaces <= this.token.decimals) ?  invariant(false, 'DECIMALS')  : void 0;
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
  function Pair(tokenAmountA, tokenAmountB, swapFee, protocolFeeDenominator) {
    this.swapFee = defaultSwapFee;
    this.protocolFeeDenominator = defaultProtocolFeeDenominator;
    !(tokenAmountA.token.chainId === tokenAmountB.token.chainId) ?  invariant(false, 'CHAIN_ID')  : void 0;
    var tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    this.liquidityToken = new Token(tokenAmounts[0].token.chainId, Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token), 18, 'DXS', 'DXswap');
    this.swapFee = swapFee ? swapFee : defaultSwapFee;
    this.protocolFeeDenominator = protocolFeeDenominator ? protocolFeeDenominator : defaultProtocolFeeDenominator;
    this.tokenAmounts = tokenAmounts;
  }

  Pair.getAddress = function getAddress(tokenA, tokenB) {
    var _CACHE, _CACHE$tokens$0$addre;

    var tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks

    if (((_CACHE = CACHE$1) === null || _CACHE === void 0 ? void 0 : (_CACHE$tokens$0$addre = _CACHE[tokens[0].address]) === null || _CACHE$tokens$0$addre === void 0 ? void 0 : _CACHE$tokens$0$addre[tokens[1].address]) === undefined) {
      var _CACHE2, _extends2, _extends3;

      CACHE$1 = _extends(_extends({}, CACHE$1), {}, (_extends3 = {}, _extends3[tokens[0].address] = _extends(_extends({}, (_CACHE2 = CACHE$1) === null || _CACHE2 === void 0 ? void 0 : _CACHE2[tokens[0].address]), {}, (_extends2 = {}, _extends2[tokens[1].address] = address.getCreate2Address(FACTORY_ADDRESS[tokenA.chainId], solidity.keccak256(['bytes'], [solidity.pack(['address', 'address'], [tokens[0].address, tokens[1].address])]), INIT_CODE_HASH), _extends2)), _extends3));
    }

    return CACHE$1[tokens[0].address][tokens[1].address];
  };

  Pair.fetchData = function fetchData(tokenA, tokenB, provider) {
    try {
      if (provider === undefined) provider = providers.getDefaultProvider(networks.getNetwork(tokenA.chainId));
      !(tokenA.chainId === tokenB.chainId) ? "development" !== "production" ? invariant(false, 'CHAIN_ID') : invariant(false) : void 0;
      var address = Pair.getAddress(tokenA, tokenB);
      return Promise.resolve(new contracts.Contract(address, IDXswapPair.abi, provider).getReserves()).then(function (_ref) {
        var reserves0 = _ref[0],
            reserves1 = _ref[1];
        var balances = tokenA.sortsBefore(tokenB) ? [reserves0, reserves1] : [reserves1, reserves0];
        var tokenAmountA = new TokenAmount(tokenA, balances[0]);
        var tokenAmountB = new TokenAmount(tokenB, balances[1]);
        var tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
        ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
        var liquidityToken = new Token(tokenAmounts[0].token.chainId, Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token), 18, 'DXS', 'DXswap');
        var _BigInt = JSBI.BigInt;
        return Promise.resolve(new contracts.Contract(liquidityToken.address, IDXswapPair.abi, provider).swapFee()).then(function (_Contract$swapFee) {
          var swapFee = _BigInt.call(JSBI, _Contract$swapFee);

          var _BigInt2 = JSBI.BigInt;
          return Promise.resolve(new contracts.Contract(FACTORY_ADDRESS[tokenAmountA.token.chainId], IDXswapFactory.abi, provider).protocolFeeDenominator()).then(function (_Contract$protocolFee) {
            var protocolFeeDenominator = _BigInt2.call(JSBI, _Contract$protocolFee);

            return new Pair(tokenAmountA, tokenAmountB, swapFee, protocolFeeDenominator);
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var _proto = Pair.prototype;

  _proto.reserveOf = function reserveOf(token) {
    !(token.equals(this.token0) || token.equals(this.token1)) ?  invariant(false, 'TOKEN')  : void 0;
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  };

  _proto.getOutputAmount = function getOutputAmount(inputAmount) {
    !(inputAmount.token.equals(this.token0) || inputAmount.token.equals(this.token1)) ?  invariant(false, 'TOKEN')  : void 0;

    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO)) {
      throw new InsufficientReservesError();
    }

    var inputReserve = this.reserveOf(inputAmount.token);
    var outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0);
    var inputAmountWithFee = JSBI.multiply(inputAmount.raw, JSBI.subtract(_10000, parseBigintIsh(this.swapFee)));
    var numerator = JSBI.multiply(inputAmountWithFee, outputReserve.raw);
    var denominator = JSBI.add(JSBI.multiply(inputReserve.raw, _10000), inputAmountWithFee);
    var outputAmount = new TokenAmount(inputAmount.token.equals(this.token0) ? this.token1 : this.token0, JSBI.divide(numerator, denominator));

    if (JSBI.equal(outputAmount.raw, ZERO)) {
      throw new InsufficientInputAmountError();
    }

    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.swapFee, this.protocolFeeDenominator)];
  };

  _proto.getInputAmount = function getInputAmount(outputAmount) {
    !(outputAmount.token.equals(this.token0) || outputAmount.token.equals(this.token1)) ?  invariant(false, 'TOKEN')  : void 0;

    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO) || JSBI.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.token).raw)) {
      throw new InsufficientReservesError();
    }

    var outputReserve = this.reserveOf(outputAmount.token);
    var inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0);
    var numerator = JSBI.multiply(JSBI.multiply(inputReserve.raw, outputAmount.raw), _10000);
    var denominator = JSBI.multiply(JSBI.subtract(outputReserve.raw, outputAmount.raw), JSBI.subtract(_10000, parseBigintIsh(this.swapFee)));
    var inputAmount = new TokenAmount(outputAmount.token.equals(this.token0) ? this.token1 : this.token0, JSBI.add(JSBI.divide(numerator, denominator), ONE));
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.swapFee, this.protocolFeeDenominator)];
  };

  _proto.getLiquidityMinted = function getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    !totalSupply.token.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    var tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    !(tokenAmounts[0].token.equals(this.token0) && tokenAmounts[1].token.equals(this.token1)) ?  invariant(false, 'TOKEN')  : void 0;
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

    !(token.equals(this.token0) || token.equals(this.token1)) ?  invariant(false, 'TOKEN')  : void 0;
    !totalSupply.token.equals(this.liquidityToken) ?  invariant(false, 'TOTAL_SUPPLY')  : void 0;
    !liquidity.token.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    !JSBI.lessThanOrEqual(liquidity.raw, totalSupply.raw) ?  invariant(false, 'LIQUIDITY')  : void 0;
    var totalSupplyAdjusted;

    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      !!!kLast ?  invariant(false, 'K_LAST')  : void 0;
      var kLastParsed = parseBigintIsh(kLast);

      if (!JSBI.equal(kLastParsed, ZERO)) {
        var rootK = sqrt(JSBI.multiply(this.reserve0.raw, this.reserve1.raw));
        var rootKLast = sqrt(kLastParsed);

        if (JSBI.greaterThan(rootK, rootKLast)) {
          var numerator = JSBI.multiply(totalSupply.raw, JSBI.subtract(rootK, rootKLast));
          var denominator = JSBI.add(JSBI.multiply(rootK, parseBigintIsh(this.protocolFeeDenominator)), rootKLast);
          var feeLiquidity = JSBI.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(new TokenAmount(this.liquidityToken, feeLiquidity));
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }

    return new TokenAmount(token, JSBI.divide(JSBI.multiply(liquidity.raw, this.reserveOf(token).raw), totalSupplyAdjusted.raw));
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
    !this.quoteToken.equals(other.baseToken) ?  invariant(false, 'BASE')  : void 0;

    var fraction = _Fraction.prototype.multiply.call(this, other);

    return new Price(this.baseToken, other.quoteToken, fraction.denominator, fraction.numerator);
  } // performs floor division on overflow
  ;

  _proto.quote = function quote(tokenAmount) {
    !tokenAmount.token.equals(this.baseToken) ?  invariant(false, 'TOKEN')  : void 0;
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
    !(pairs.length > 0) ?  invariant(false, 'PAIRS')  : void 0;
    !pairs.map(function (pair) {
      return pair.token0.chainId === pairs[0].token0.chainId;
    }).every(function (x) {
      return x;
    }) ?  invariant(false, 'CHAIN_IDS')  : void 0;
    var path = [input];

    for (var _iterator = _createForOfIteratorHelperLoose(pairs.entries()), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
          i = _step$value[0],
          pair = _step$value[1];
      var currentInput = path[i];
      !(currentInput.equals(pair.token0) || currentInput.equals(pair.token1)) ?  invariant(false, 'PATH')  : void 0;
      var output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
      path.push(output);
    }

    !(path.length === new Set(path).size) ?  invariant(false, 'PATH')  : void 0;
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
  !a.inputAmount.token.equals(b.inputAmount.token) ?  invariant(false, 'INPUT_TOKEN')  : void 0;
  !a.outputAmount.token.equals(b.outputAmount.token) ?  invariant(false, 'OUTPUT_TOKEN')  : void 0;

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
  function Trade(route, amount, tradeType) {
    !amount.token.equals(tradeType === exports.TradeType.EXACT_INPUT ? route.input : route.output) ?  invariant(false, 'TOKEN')  : void 0;
    var amounts = new Array(route.path.length);
    var nextPairs = new Array(route.pairs.length);

    if (tradeType === exports.TradeType.EXACT_INPUT) {
      amounts[0] = amount;

      for (var i = 0; i < route.path.length - 1; i++) {
        var pair = route.pairs[i];

        var _pair$getOutputAmount = pair.getOutputAmount(amounts[i]),
            _outputAmount = _pair$getOutputAmount[0],
            nextPair = _pair$getOutputAmount[1];

        amounts[i + 1] = _outputAmount;
        nextPairs[i] = nextPair;
      }
    } else {
      amounts[amounts.length - 1] = amount;

      for (var _i = route.path.length - 1; _i > 0; _i--) {
        var _pair = route.pairs[_i - 1];

        var _pair$getInputAmount = _pair.getInputAmount(amounts[_i]),
            _inputAmount = _pair$getInputAmount[0],
            _nextPair = _pair$getInputAmount[1];

        amounts[_i - 1] = _inputAmount;
        nextPairs[_i - 1] = _nextPair;
      }
    }

    this.route = route;
    this.tradeType = tradeType;
    var inputAmount = amounts[0];
    var outputAmount = amounts[amounts.length - 1];
    this.inputAmount = inputAmount;
    this.outputAmount = outputAmount;
    this.executionPrice = new Price(route.input, route.output, inputAmount.raw, outputAmount.raw);
    this.nextMidPrice = Price.fromRoute(new Route(nextPairs, route.input));
    this.slippage = getSlippage(route.midPrice, inputAmount, outputAmount);
  } // get the minimum amount that must be received from this trade for the given slippage tolerance


  var _proto = Trade.prototype;

  _proto.minimumAmountOut = function minimumAmountOut(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ?  invariant(false, 'SLIPPAGE_TOLERANCE')  : void 0;

    if (this.tradeType === exports.TradeType.EXACT_OUTPUT) {
      return this.outputAmount;
    } else {
      return new TokenAmount(this.outputAmount.token, new Fraction(ONE).add(slippageTolerance).invert().multiply(this.outputAmount.raw).quotient);
    }
  } // get the maximum amount in that can be spent via this trade for the given slippage tolerance
  ;

  _proto.maximumAmountIn = function maximumAmountIn(slippageTolerance) {
    !!slippageTolerance.lessThan(ZERO) ?  invariant(false, 'SLIPPAGE_TOLERANCE')  : void 0;

    if (this.tradeType === exports.TradeType.EXACT_INPUT) {
      return this.inputAmount;
    } else {
      return new TokenAmount(this.inputAmount.token, new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.raw).quotient);
    }
  } // given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
  // amount to an output token, making at most `maxHops` hops
  // note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
  // the amount in among multiple routes.
  ;

  Trade.bestTradeExactIn = function bestTradeExactIn(pairs, amountIn, tokenOut, _temp, // used in recursion.
  currentPairs, originalAmountIn, bestTrades) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$maxNumResults = _ref.maxNumResults,
        maxNumResults = _ref$maxNumResults === void 0 ? 3 : _ref$maxNumResults,
        _ref$maxHops = _ref.maxHops,
        maxHops = _ref$maxHops === void 0 ? 3 : _ref$maxHops;

    if (currentPairs === void 0) {
      currentPairs = [];
    }

    if (originalAmountIn === void 0) {
      originalAmountIn = amountIn;
    }

    if (bestTrades === void 0) {
      bestTrades = [];
    }

    !(pairs.length > 0) ?  invariant(false, 'PAIRS')  : void 0;
    !(maxHops > 0) ?  invariant(false, 'MAX_HOPS')  : void 0;
    !(originalAmountIn === amountIn || currentPairs.length > 0) ?  invariant(false, 'INVALID_RECURSION')  : void 0;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]; // pair irrelevant

      if (!pair.token0.equals(amountIn.token) && !pair.token1.equals(amountIn.token)) continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue;

      var _amountOut = void 0;

      try {
        ;

        var _pair$getOutputAmount2 = pair.getOutputAmount(amountIn);

        _amountOut = _pair$getOutputAmount2[0];
      } catch (error) {
        // input too low
        if (error.isInsufficientInputAmountError) {
          continue;
        }

        throw error;
      } // we have arrived at the output token, so this is the final trade of one of the paths


      if (_amountOut.token.equals(tokenOut)) {
        sortedInsert(bestTrades, new Trade(new Route([].concat(currentPairs, [pair]), originalAmountIn.token), originalAmountIn, exports.TradeType.EXACT_INPUT), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops

        Trade.bestTradeExactIn(pairsExcludingThisPair, _amountOut, tokenOut, {
          maxNumResults: maxNumResults,
          maxHops: maxHops - 1
        }, [].concat(currentPairs, [pair]), originalAmountIn, bestTrades);
      }
    }

    return bestTrades;
  } // similar to the above method but instead targets a fixed output amount
  // given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
  // to an output token amount, making at most `maxHops` hops
  // note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
  // the amount in among multiple routes.
  ;

  Trade.bestTradeExactOut = function bestTradeExactOut(pairs, tokenIn, amountOut, _temp2, // used in recursion.
  currentPairs, originalAmountOut, bestTrades) {
    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$maxNumResults = _ref2.maxNumResults,
        maxNumResults = _ref2$maxNumResults === void 0 ? 3 : _ref2$maxNumResults,
        _ref2$maxHops = _ref2.maxHops,
        maxHops = _ref2$maxHops === void 0 ? 3 : _ref2$maxHops;

    if (currentPairs === void 0) {
      currentPairs = [];
    }

    if (originalAmountOut === void 0) {
      originalAmountOut = amountOut;
    }

    if (bestTrades === void 0) {
      bestTrades = [];
    }

    !(pairs.length > 0) ?  invariant(false, 'PAIRS')  : void 0;
    !(maxHops > 0) ?  invariant(false, 'MAX_HOPS')  : void 0;
    !(originalAmountOut === amountOut || currentPairs.length > 0) ?  invariant(false, 'INVALID_RECURSION')  : void 0;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]; // pair irrelevant

      if (!pair.token0.equals(amountOut.token) && !pair.token1.equals(amountOut.token)) continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue;

      var _amountIn = void 0;

      try {
        ;

        var _pair$getInputAmount2 = pair.getInputAmount(amountOut);

        _amountIn = _pair$getInputAmount2[0];
      } catch (error) {
        // not enough liquidity in this pair
        if (error.isInsufficientReservesError) {
          continue;
        }

        throw error;
      } // we have arrived at the input token, so this is the first trade of one of the paths


      if (_amountIn.token.equals(tokenIn)) {
        sortedInsert(bestTrades, new Trade(new Route([pair].concat(currentPairs), tokenIn), originalAmountOut, exports.TradeType.EXACT_OUTPUT), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops

        Trade.bestTradeExactOut(pairsExcludingThisPair, tokenIn, _amountIn, {
          maxNumResults: maxNumResults,
          maxHops: maxHops - 1
        }, [pair].concat(currentPairs), originalAmountOut, bestTrades);
      }
    }

    return bestTrades;
  };

  return Trade;
}();

exports.JSBI = JSBI;
exports.DXD = DXD;
exports.FACTORY_ADDRESS = FACTORY_ADDRESS;
exports.Fees = Fees;
exports.Fraction = Fraction;
exports.INIT_CODE_HASH = INIT_CODE_HASH;
exports.InsufficientInputAmountError = InsufficientInputAmountError;
exports.InsufficientReservesError = InsufficientReservesError;
exports.MINIMUM_LIQUIDITY = MINIMUM_LIQUIDITY;
exports.Pair = Pair;
exports.Percent = Percent;
exports.Price = Price;
exports.Route = Route;
exports.TEST_TOKENS = TEST_TOKENS;
exports.Token = Token;
exports.TokenAmount = TokenAmount;
exports.Trade = Trade;
exports.WETH = WETH;
exports.inputOutputComparator = inputOutputComparator;
exports.parseBigintIsh = parseBigintIsh;
exports.tradeComparator = tradeComparator;
//# sourceMappingURL=dxswap-sdk.cjs.development.js.map
