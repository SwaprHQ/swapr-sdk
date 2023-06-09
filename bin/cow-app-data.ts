import { CowSdk, IpfsHashInfo, LatestAppDataDocVersion } from '@cowprotocol/cow-sdk'
import { writeFile } from 'fs/promises'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export interface GnosisProtocolMetadata {
  ipfsHashInfo: IpfsHashInfo
  content: LatestAppDataDocVersion
}

const argv = yargs(hideBin(process.argv))
  .option('pinata-api-key', {
    type: 'string',
    requiresArg: true,
    describe: 'Pinata API key',
  })
  .option('pinata-api-secret', {
    type: 'string',
    requiresArg: true,
    describe: 'Pinata API secret',
  })
  .demandOption('pinata-api-key')
  .demandOption('pinata-api-secret').argv

export const dxdaoTreasuryAddress: Record<number, string> = {
  1: '0x519b70055af55A007110B4Ff99b0eA33071c720a',
  100: '0xe716ec63c5673b3a4732d22909b38d779fa47c3f',
} as const

interface GetOrderMetadataParams {
  chainId: number
  pinataApiKey: string
  pinataApiSecret: string
}

/**
 * Returns the Gnosis Protocol metadata all given network IDs
 * @returns
 */
export async function getOrderMetadata({
  chainId,
  pinataApiKey,
  pinataApiSecret,
}: GetOrderMetadataParams): Promise<GnosisProtocolMetadata> {
  const appCode = 'Swapr' // default
  const cowSdkInstance = new CowSdk(chainId, {
    ipfs: {
      pinataApiKey,
      pinataApiSecret,
    },
  })

  const content = await cowSdkInstance.metadataApi.generateAppDataDoc({
    metadataParams: {
      referrerParams: {
        address: dxdaoTreasuryAddress[chainId],
      },
    },
    appDataParams: {
      appCode,
    },
  })
  const ipfsHashInfo = (await cowSdkInstance.metadataApi.calculateAppDataHash(content)) as IpfsHashInfo
  await cowSdkInstance.metadataApi.uploadMetadataDocToIpfs(content)

  return {
    ipfsHashInfo,
    content,
  }
}

export async function main() {
  const pinataApiKey = argv['pinata-api-key']
  const pinataApiSecret = argv['pinata-api-secret']
  const chainIds = [1, 100]
  const promises = await chainIds.map(async (chainId) => ({
    chainId,
    metadata: await getOrderMetadata({
      chainId,
      pinataApiKey,
      pinataApiSecret,
    }),
  }))

  const fileContent: Record<number, GnosisProtocolMetadata> = {}

  for (const { chainId, metadata } of await Promise.all(promises)) {
    fileContent[chainId] = metadata
  }

  await writeFile(`./src/entities/trades/gnosis-protocol/app-data.json`, JSON.stringify(fileContent, null, 2))

  console.log('Files writtens to ./src/entities/trades/gnosis-protocol/app-data.json')
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
