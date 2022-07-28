interface CustomMatchers<R = unknown> {
  toBeAddress(): R
}

declare global {
  namespace jest {
    type Expect = CustomMatchers
    type Matchers<R> = CustomMatchers<R>
    type InverseAsymmetricMatchers = CustomMatchers
  }
}

export {}
