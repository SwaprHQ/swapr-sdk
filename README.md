# DXswap SDK

## Running tests

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

You should see output like the following:

```sh
yarn run v1.22.4
$ tsdx test
 PASS  test/constants.test.ts (6.67s)
 PASS  test/pair.test.ts (6.805s)
 PASS  test/fraction.test.ts (6.874s)
 PASS  test/miscellaneous.test.ts (6.944s)
 PASS  test/entities.test.ts (7.108s)
 PASS  test/trade.test.ts (7.223s)

Test Suites: 1 skipped, 6 passed, 6 of 7 total
Tests:       3 skipped, 82 passed, 85 total
Snapshots:   0 total
Time:        8.319s
Ran all test suites.
✨  Done in 6.61s.
```
