interface PublicKeyDisplayProps {
    publicKey: string
    length?: number
}

export const PublicKeyDisplay = ({ publicKey, length = 24 }: PublicKeyDisplayProps) => {
    return <>{publicKey.slice(0, length)}...</>
}
