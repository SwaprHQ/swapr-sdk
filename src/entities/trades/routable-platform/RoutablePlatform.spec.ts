import { RoutablePlatform } from './RoutablePlatform'

describe('RouteablePlatform', () => {
  test('should be able to create a new instance of the platform', () => {
    const routablePlatform1 = new RoutablePlatform([], 'x')
    expect(routablePlatform1.chainIds.length).toBe(0)
    expect(routablePlatform1.name).toBe('x')
  })

  describe('supportsChain', () => {
    test('reflected instance properties ', () => {
      const routablePlatform1 = new RoutablePlatform([1], 'x')
      expect(routablePlatform1.supportsChain(1)).toBeTruthy()
      expect(routablePlatform1.supportsChain(2)).toBeFalsy()
    })
  })
})
