import { FunctionFragment, Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'

import { getMulticallContract, getQuoterContract } from '../contracts'

interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}
interface CallState {
  readonly valid: boolean
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined
}

function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | undefined,
): CallState {
  if (!callResult || !contractInterface || !fragment) return { valid: false, result: undefined }
  const { valid, data } = callResult
  if (!valid) return { valid: false, result: undefined }

  const success = data && data.length > 2
  let result

  if (success) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data)
    } catch (error) {
      console.error('Result data parsing failed', fragment, data)
      return {
        valid: true,
        result,
      }
    }
  }

  return {
    valid: false,
    result,
  }
}

type MethodArg = string | number | BigNumber
type MethodArgs = Array<MethodArg | MethodArg[]>

type OptionalMethodInputs = Array<MethodArg | MethodArg[] | undefined> | undefined

function isMethodArg(x: unknown): x is MethodArg {
  return BigNumber.isBigNumber(x) || ['string', 'number'].indexOf(typeof x) !== -1
}

function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) && x.every((xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))))
  )
}

interface CallResult {
  readonly valid: boolean
  readonly data: string | undefined
}

interface Call {
  address: string
  callData: string
  gasRequired?: number
}

export async function singleContractMultipleData(
  methodName: string,
  callInputs: OptionalMethodInputs[],
  options: { gasRequired?: number } = {},
): Promise<CallState[]> {
  const quoterContract = await getQuoterContract()
  const fragment = quoterContract?.interface?.getFunction(methodName)

  const gasRequired = options?.gasRequired

  const calls =
    quoterContract && fragment && callInputs?.length > 0 && callInputs.every((inputs) => isValidMethodArgs(inputs))
      ? callInputs.map<Call>((inputs) => {
          return {
            address: quoterContract.address,
            callData: quoterContract.interface.encodeFunctionData(fragment, inputs),
            ...(gasRequired ? { gasRequired } : {}),
          }
        })
      : []
  const multicallContract = await getMulticallContract()

  const { returnData } = (await multicallContract.callStatic.multicall(
    calls.map((obj) => ({
      target: obj.address,
      callData: obj.callData,
      gasLimit: obj.gasRequired,
    })),
  )) as { returnData: Array<any> }

  const results = returnData.map<string>((data) => {
    if (data.success) {
      return data.returnData ?? null
    }
    return null
  }, [])

  const callResult = results.map<CallResult>((call) => {
    if (!call || call === '0x') return { valid: false, data: undefined }

    return { valid: true, data: call }
  })

  return callResult.map((result) => toCallState(result, quoterContract?.interface, fragment))
}
