# Swapr SDK

## Getting Started

### Running tests

To run the tests, follow these steps. You must have at least node v10 and [yarn](https://yarnpkg.com/) installed.

First clone the repository:

```sh
git clone https://github.com/levelkdev/dxswap-sdk.git
```

Move into the dxswap-sdk working directory

```sh
cd dxswap-sdk/
```

Install dependencies

```sh
yarn install
```

Run tests

```sh
yarn test
```

## Eco Router Trades

Swapr uses multiple trades to find best protocol and route for traders. Currently supported DEXs are

| Protocol     | Ethereum | Arbitrum One | Gnosis Chain |
| ------------ | -------- | ------------ | ------------ |
| Swapr        | ✅       | ✅           | ✅           |
| Uniswap v2   | ✅       | ✅           | ✅           |
| SushiSwap    | ✅       | ✅           | ✅           |
| Honeyswap    |          |              | ✅           |
| Levinswap    |          |              | ✅           |
| Baoswap      |          |              | ✅           |
| Curve        | WIP      | ✅           | ✅           |
| CoW Protocol | ✅       |              | ✅           |

The `Trade` class is extendable. New DEXs can be added to the SDK by extending the `Trade` and adding required methods.
