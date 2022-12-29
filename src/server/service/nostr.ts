import { getEventHash, getPublicKey, Relay, relayInit, signEvent } from 'nostr-tools'
import 'websocket-polyfill'
import * as secp256k1 from '@noble/secp256k1'
import { randomBytes } from '@noble/hashes/utils'
import { utf8Encoder } from 'nostr-tools/utils'

import { encode as b64encode } from 'base64-arraybuffer'
import { webcrypto as crypro } from 'crypto'

const getRelayStatus = (relay: Relay) => {
    try {
        return relay.status
    } catch (e) {
        return 3
    }
}

function getNormalizedX(key: Uint8Array): Uint8Array {
    return key.slice(1, 33)
}

export async function encrypt(privateKey: string, pubkey: string, text: string): Promise<string> {
    const key = secp256k1.getSharedSecret(privateKey, '02' + pubkey)
    const normalizedKey = getNormalizedX(key)

    const iv = Uint8Array.from(randomBytes(16))
    const plaintext = utf8Encoder.encode(text)
    const cryptoKey = await crypro.subtle.importKey('raw', normalizedKey, { name: 'AES-CBC' }, false, ['encrypt'])
    const ciphertext = await crypro.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, plaintext)
    const ctb64 = b64encode(ciphertext)
    const ivb64 = b64encode(iv.buffer)

    return `${ctb64}?iv=${ivb64}`
}

const getConnectedRelays = async () => {
    const envRelays = JSON.parse(`${process.env.NOSTR_RELAY_POOL}`) as string[]

    const relays = await Promise.all(
        envRelays.map(async (relay) => {
            const relayInstance = relayInit(relay)
            await relayInstance.connect()
            return relayInstance
        }),
    )

    return relays.filter((relay) => getRelayStatus(relay) === 1)
}

export const sendDMToWebsiteAccount = async (msg: string) => {
    const publicKey = getPublicKey(`${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`)

    const connectedRelay = await getConnectedRelays()

    const ciphertext = await encrypt(
        `${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`,
        `${process.env.WEBSITE_NOTIFICATION_RECIPIENT_NOSTR_PUBLIC_KEY}`,
        msg,
    )

    const event = {
        id: '',
        sig: '',
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        pubkey: publicKey,
        tags: [['p', `${process.env.WEBSITE_NOTIFICATION_RECIPIENT_NOSTR_PUBLIC_KEY}`]],
        content: ciphertext,
    }

    event.id = getEventHash(event)
    event.sig = await signEvent(event, `${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`)

    await Promise.all(
        connectedRelay.map((relay) => {
            const pub = relay.publish(event)
            pub.on('ok', () => {
                console.log('ok', msg)
            })
            pub.on('failed', (err: any) => {
                console.log('failed', err)
            })
            relay.close()
        }),
    )

    return
}

export const sendDMToUser = async (recipientPubKey: string, msg: string) => {
    const publicKey = getPublicKey(`${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`)

    const connectedRelay = await getConnectedRelays()

    const ciphertext = await encrypt(`${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`, recipientPubKey, msg)

    const event = {
        id: '',
        sig: '',
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        pubkey: publicKey,
        tags: [['p', recipientPubKey]],
        content: ciphertext,
    }

    event.id = getEventHash(event)
    event.sig = await signEvent(event, `${process.env.WEBSITE_PRIVATE_NOSTR_KEY}`)

    await Promise.all(
        connectedRelay.map((relay) => {
            const pub = relay.publish(event)
            pub.on('ok', () => {
                console.log('ok', msg)
            })
            pub.on('failed', (err: any) => {
                console.log('failed', err)
            })
            relay.close()
        }),
    )

    return
}
