import { getParams, LNURLAuthParams } from 'js-lnurl'
import { randomBytes } from 'crypto'
import { expect, test } from '@playwright/test'
import { createUser, deleteUser, getSigAndKey } from './test-utils'

test.setTimeout(35e3)

test.describe('user auth', async () => {
    test('user creates an account', async ({ page, request }) => {
        await page.goto('/')
        const privateKey = randomBytes(32).toString('hex')

        // Login

        const key = await createUser(page, privateKey, request)
        const publicKeyContainer = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyText = await publicKeyContainer?.innerText()

        expect(publicKeyText.slice(0, 24)).toBe(key.slice(0, 24))

        await deleteUser(page)
    })

    test('user logs out and back in after account creation', async ({ page, request }) => {
        await page.goto('/')
        const privateKey = randomBytes(32).toString('hex')

        // First login

        const key = await createUser(page, privateKey, request)

        const publicKeyContainer = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyTextTarget = await publicKeyContainer?.innerText()

        // Second login

        await page.click('id=logout-button')
        await page.click('id=open-authenticate-button')
        const bolt11Container2 = await page.waitForSelector('id=bolt11-text')
        const bolt11Text2 = await bolt11Container2?.innerText()

        const cb2 = await getParams(bolt11Text2 ?? '').then((params) => {
            return params as LNURLAuthParams
        })

        const { sig: sig2, key: key2 } = getSigAndKey(cb2, privateKey)
        const authenticateUrl2 = `${cb2.callback}&sig=${sig2}&key=${key2}`
        await request.get(authenticateUrl2)
        const publicKeyContainer2 = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyTextTarget2 = await publicKeyContainer2?.innerText()

        expect(publicKeyTextTarget.slice(0, 24)).toBe(publicKeyTextTarget2.slice(0, 24))

        await deleteUser(page)
    })

    test('user does some shady business', async ({ page, request }) => {
        await page.goto('/')
        const privateKey = randomBytes(32).toString('hex')

        // First login

        await page.click('id=open-authenticate-button')
        const bolt11Container = await page.waitForSelector('id=bolt11-text')
        const bolt11Text = await bolt11Container?.innerText()

        const cb = await getParams(bolt11Text ?? '').then((params) => {
            const authParams = params as LNURLAuthParams
            // fake secret
            return { ...authParams, k1: authParams.k1.replace('a', 'd') } as LNURLAuthParams
        })

        const { sig, key } = getSigAndKey(cb, privateKey)
        const authenticateUrl = `${cb.callback}&sig=${sig}&key=${key}`
        await request.get(authenticateUrl)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // nothing happens

        // Second login

        await page.click('id=modal-close')
        await page.click('id=open-authenticate-button')
        const bolt11Container2 = await page.waitForSelector('id=bolt11-text')
        const bolt11Text2 = await bolt11Container2?.innerText()

        const cb2 = await getParams(bolt11Text2 ?? '').then((params) => {
            return params as LNURLAuthParams
        })

        const { sig: sig2, key: key2 } = getSigAndKey(cb2, privateKey)

        // fake signature
        const authenticateUrl2 = `${cb2.callback}&sig=${sig2.replace('a', 'd')}&key=${key2}`
        await request.get(authenticateUrl2)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // nothing happens

        await page.click('id=modal-close')
    })
})
