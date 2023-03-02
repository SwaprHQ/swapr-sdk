"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_ALL_COMMON_PAIRS_BETWEEN_TOKEN_A_AND_TOKEN_B = void 0;
const graphql_request_1 = require("graphql-request");
exports.GET_ALL_COMMON_PAIRS_BETWEEN_TOKEN_A_AND_TOKEN_B = (0, graphql_request_1.gql) `
  query GetAllCommonPairsBetweenTokenAAndTokenB($tokenA: String!, $tokenB: String!) {
    pairsWithTokenA: pairs(where: { token0_in: [$tokenA, $tokenB] }) {
      ...PairDetails
    }
    pairsWithTokenB: pairs(where: { token1_in: [$tokenB, $tokenA] }) {
      ...PairDetails
    }
  }

  fragment PairDetails on Pair {
    id
    reserve0
    reserve1
    token0 {
      ...TokenDetails
    }
    token1 {
      ...TokenDetails
    }
  }

  fragment TokenDetails on Token {
    id
    name
    symbol
    decimals
  }
`;
//# sourceMappingURL=queries.js.map