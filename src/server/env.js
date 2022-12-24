// @ts-check
/**
 * This file is included in `/next.config.js` which ensures the app isn't built with invalid env vars.
 * It has to be a `.js`-file to be imported there.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const { z } = require('zod')

/*eslint sort-keys: "error"*/
const envSchema = z.object({
    COMPOSITE_DOMAIN: z.string().url().optional(),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    LND_CERT: z.string(),
    LND_HOST: z.string(),
    LND_MACAROON: z.string(),
    LND_PORT: z.string(),
    LN_AUTH_URL: z.string().url(),
    LN_WITH_CREATE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    NOSTR_RELAY_POOL: z.string(),
    WEBSITE_NOTIFICATION_RECIPIENT_NOSTR_PUBLIC_KEY: z.string().length(64),
    WEBSITE_PRIVATE_NOSTR_KEY: z.string().length(64),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(env.error.format(), null, 4))
    process.exit(1)
}
module.exports.env = env.data
