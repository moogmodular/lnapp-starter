interface PublicKeyDisplayProps {
    publicKey: string
    length?: number
}

export const PublicKeyDisplay = ({ publicKey }: PublicKeyDisplayProps) => {
    return (
        <>
            <b>Public Key:</b> {publicKey}
        </>
    )
}
