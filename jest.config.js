const config = {
  verbose: true,
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/scripts/', '<rootDir>/test-util/'],
  testTimeout: 1200000 // 20 minutes
}

module.exports = config
