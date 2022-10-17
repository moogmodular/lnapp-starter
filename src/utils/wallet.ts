import secp256k1 from 'secp256k1'

export const signMessageWithWallet = (message: string, privateKey: string) => {
    const msg = Buffer.from(message, 'hex')
    const privateBuffer = Buffer.from(privateKey, 'hex')

    const publicKey = secp256k1.publicKeyCreate(privateBuffer)
    const signature = secp256k1.ecdsaSign(msg, privateBuffer).signature
    const exportedSignature = secp256k1.signatureExport(signature)

    return {
        publicKey,
        exportedSignature,
    }
}
