/**
 * CoWTradeError
 */
export class CoWTradeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CoWTradeError'
  }
}
