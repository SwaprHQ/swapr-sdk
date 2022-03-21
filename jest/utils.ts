import { JsonRpcProvider } from '@ethersproject/providers'
import { isAddress } from '@ethersproject/address'
import { exec as execBase } from 'child_process'

/**
 * Wraps `child_process.exec` in a promise
 * @param command
 */
export function execAsync(command: string) {
  return new Promise<string>((resolve, reject) => {
    return execBase(command, (err, stdut) => {
      if (err) {
        return reject(err)
      }

      return resolve(stdut)
    })
  })
}

/**
 *
 */
export async function getGanacheRPCProvider(timeout = 10000): Promise<JsonRpcProvider> {
  let retryCt = 0
  let provider: JsonRpcProvider | undefined = undefined

  while (retryCt * 100 < timeout) {
    try {
      provider = new JsonRpcProvider()
      const isReady = await provider.ready
      const blockNumber = await provider.getBlockNumber()

      if (isReady) {
        console.log(`Provider ready @ block #${blockNumber}`)
        break
      }
    } catch (e) {
      console.log(e)
    }

    retryCt++
  }

  return provider as JsonRpcProvider
}

expect.extend({
  toBeAddress(received) {
    const pass = isAddress(received)
    if (pass) {
      return {
        message: () => `expected ${received} not to be EVM address`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be EVM address`,
        pass: false,
      }
    }
  },
})
