# Next.js - tRPC - LN App starter

Convenient starter for Lightning Network driven web apps. This starter is based on [@alexdotjs](https://twitter.com/alexdotjs)'s tRPC [starter project](https://github.com/trpc/examples-next-prisma-starter). Since the inception of the **lightning network** and the development of the [ln-url](https://github.com/fiatjaf/lnurl-rfc) standard, the holy grail of **"bank as a web app"** is not only a reality but only 5 minutes of set up time and about 30$ of hosting costs away. This starter implements such an app. Authentication and Users are already there, and basic in- and out flow of purchasing power is taken care of. Users can **authenticate themselves**, **deposit** and **withdraw** up to **1000 sats**. Basic accounting and inter user tipping has been added so can also tip each other sats. Whatever happens in between is up to the developer. Since the latest update basic [nostr](https://github.com/nostr-protocol/nostr) interaction has been added so that the website owner gets notified when a new account has been created and individual users can get a message to their nostr public key given that they provided one.

Much of the backend lnd interaction was inspired by open source projects like [stacker.news](https://github.com/stackernews/stacker.news), [lightning-poker.com](https://github.com/igreshev/lightning-poker) and [ln-jukebox
](https://github.com/alexlwn123/ln-jukebox)

Happy Hacking!

![The King](./public/the_one_and_only_king.jpg)

## Features

-   🌽️ 0nly
-   🧙‍♂️ E2E typesafety with [tRPC](https://trpc.io)
-   🚪 Full-stack React with [Next.js](https://nextjs.org/)
-   🫙 Database with [Prisma](https://www.prisma.io/)
-   ⚡ lnd connection with [ln-service/lightning](https://github.com/alexbosworth/lightning)
-   💻 [webln](https://webln.dev/) enabled
-   🔭 notifications for website owner and users with the [nostr](https://github.com/nostr-protocol/nostr) protocol
-   🪙 simple bloatless auth with [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
-   🏢 state management [zustand](https://github.com/pmndrs/zustand)
-   🌬️ easy to use styling with [tailwind](https://tailwindcss.com/)
-   🔮 REST endpoints with [trpc-openapi](https://github.com/jlalmes/trpc-openapi)
-   🎭 e2e testing with [Playwright](https://playwright.dev/)
-   🖊️ form handling with [react-hook-form](https://react-hook-form.com/)
-   ✨️ validation with [zod](https://github.com/colinhacks/zod)
-   🦋️ formatting with [prettier](https://prettier.io/)

## Setup

**yarn:**

```bash
yarn
yarn dx
```

## Start Development

**yarn:**

```bash
yarn dev -H <YOUR_LOCAL_IP>
```

### Requirements

-   Node >= 14
-   Postgres

## Notes

### tRPC vs. REST

While tRPC does an amazing job handling the contracts between our Backend and Frontend, ln-url enabled wallets all use REST endpoints. This is why we have exposed some procedures as REST endpoints for ln-url using `trpc-openapi` which gives us full control on the shape of our responses.

-   `auth` is exposed as `/api/authenticate`
-   `create withdrawal` is exposed as `/api/create-withdrawal`
-   `execute withdrawal` is exposed as `/api/do-withdrawal`

### Ln-url QR-codes

There is a `DOMAIN=192.168.0.XXX` entry in the `.env` file which is used to generate `LN_AUTH_URL=http://${DOMAIN}:3000/api/authenticate`. This is used to generate the ln-url QR-codes.

`const encoded = encodedUrl(process.env.LN_AUTH_URL ?? 'http://localhost:3000/api/authenticate', 'login', secret)`

If you want the wallet on your cell phone to reach the server on your local machine which is connected to your local network, you need to find out your local ip-address. Keep in mind that public keys generated with this method will always be bound to a certain url (in this case `http://192.168.0.XXX:3000/api/authenticate` or `https://myapp.app/api/authenticate`).

### Hosting

By experience [railway.app](https://railway.app/)'s setup was the easiest but there is no reason why this shouldnt work on any other Next.js compatible service like [Render](https://render.com/) or [Vercel](https://vercel.com/).

### e2e tests

In order to run the e2e tests the vars in `.jest/setEnvVars.js` have to be completed.

### Lightning Node

While at first glance it might look attractive to be independent and cool to use a self hosted node like [Umbrel](https://getumbrel.com/) i would not recommend making your production LN app dependent on a raspberry pi stored inside your tv cabinet. Also Umbrel is still quite buggy: this [bug](https://github.com/getumbrel/umbrel/issues/1421) prevents you from ever connecting from the outside to your node because `lnd.conf` entries are ignored while generating your `tls.cert`. Save yourself the trouble. The way with least friction seems to a hosted lnd node on [voltage](https://voltage.cloud/).

## Development

### Start project

```bash
yarn dx
```

### Commands

```bash
yarn build      # runs `prisma generate` + `prisma migrate` + `next build`
yarn db-reset   # resets local db
yarn dev        # starts next.js
yarn dx         # starts postgres db + runs migrations + seeds + starts next.js
yarn test-dev   # runs e2e tests on dev
yarn test-start # runs e2e tests on `next start` - build required before
yarn test:unit  # runs normal jest unit tests
yarn test:e2e   # runs e2e tests
```

---

`zeRealSchlausKwab@stacker.news`

![zeRealSchlausKwab@stacker.news](./public/img.png)

---

Created by [@SchlausKwab](https://twitter.com/SchlausKwab), [zeRealSchlausKwab](https://t.me/zeRealSchlausKwab).
