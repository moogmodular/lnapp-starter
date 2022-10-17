import { createHash, randomBytes } from 'crypto'
import { URL } from 'url'

import { bech32 } from 'bech32'

export const encodedUrl = (iUrl: string, tag: string, k1: string) => {
    const url = new URL(iUrl)
    url.searchParams.set('tag', tag)
    url.searchParams.set('k1', k1)
    const words = bech32.toWords(Buffer.from(url.toString(), 'utf8'))
    return bech32.encode('lnurl', words, 1023)
}

export const k1 = () => {
    return randomBytes(32).toString('hex')
}

export function lnurlPayDescriptionHash(data: any) {
    return createHash('sha256').update(data).digest('hex')
}

export const getK1Hash = (secret: string) => createHash('sha256').update(secret).digest('hex')
