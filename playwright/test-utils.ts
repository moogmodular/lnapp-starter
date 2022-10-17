import { getParams, LNURLAuthParams } from 'js-lnurl'
import { signMessageWithWallet } from '~/utils/wallet'
import { APIRequestContext, Page } from '@playwright/test'

export const getSigAndKey = (cb: LNURLAuthParams, privateKey: string) => {
    const { publicKey, exportedSignature } = signMessageWithWallet(cb.k1, privateKey)
    const sig = Buffer.from(exportedSignature).toString('hex')
    const key = Buffer.from(publicKey).toString('hex')
    return { sig, key }
}

export const createUser = async (page: Page, privateKey: string, request: APIRequestContext) => {
    await page.click('id=open-authenticate-button')

    const bolt11Container = await page.waitForSelector('id=bolt11-text')

    const bolt11Text = await bolt11Container?.innerText()

    const cb = await getParams(bolt11Text ?? '').then((params) => {
        return params as LNURLAuthParams
    })
    const { sig, key } = getSigAndKey(cb, privateKey)

    const authenticateUrl = `${cb.callback}&sig=${sig}&key=${key}`

    await request.get(authenticateUrl)
    return key
}

export const deleteUser = async (page: Page) => {
    await page.click('id=button-edit-profile')
    await page.click('id=edit-profile-delete-user')
}
