
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dxswap-sdk.cjs.production.min.js')
} else {
  module.exports = require('./dxswap-sdk.cjs.development.js')
}
