# Swapr SDK

## Getting Started

### Running tests

To run the tests, follow these steps. You must have at least node v16 installed.

First clone the repository:

```sh
git clone https://github.com/levelkdev/swapr-sdk.git
```

Move into the dxswap-sdk working directory

```sh
cd swapr-sdk
```

Install dependencies

```sh
npm install
```

Run tests

```sh
npm run test
```

## Eco Router Trades

Swapr uses multiple trades to find best protocol and route for traders. Currently supported DEXs are

| Protocol     | Ethereum | Arbitrum One | Gnosis Chain | Polygon |
| ------------ | -------- | ------------ | ------------ | ------- |
| Swapr        | ✅       | ✅           | ✅           |         |
| Uniswap v2   | ✅       | ✅           | ✅           |         |
| SushiSwap    | ✅       | ✅           | ✅           | ✅      |
| Honeyswap    |          |              | ✅           |         |
| Levinswap    |          |              | ✅           |         |
| Baoswap      |          |              | ✅           |         |
| Curve        | WIP      | ✅           | ✅           |         |
| CoW Protocol | ✅       |              | ✅           |         |
| Quickswap    |          |              |              | ✅      |
| DFYN         |          |              |              | ✅      |

The `Trade` class is extendable. New DEXs can be added to the SDK by extending the `Trade` and adding required methods.
