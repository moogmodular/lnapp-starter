import { authenticatedLndGrpc } from 'lightning'

export const { lnd } = authenticatedLndGrpc({
    cert: process.env.LND_CERT,
    macaroon: process.env.LND_MACAROON,
    socket: `${process.env.LND_HOST}:${process.env.LND_PORT}`,
})
