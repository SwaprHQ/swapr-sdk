export interface TokenInfo {
  readonly chainId: number
  readonly address: string
  readonly name: string
  readonly decimals: number
  readonly symbol: string
  readonly logoURI?: string
  readonly tags?: string[]
}

export interface Version {
  readonly major: number
  readonly minor: number
  readonly patch: number
}

export interface TokenList {
  readonly name: string
  readonly timestamp: string
  readonly version: Version
  readonly tokens: TokenInfo[]
  readonly keywords?: string[]
  readonly logoURI?: string
}
