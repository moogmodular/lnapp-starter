import { randomBytes } from 'crypto'
import { expect, test } from '@playwright/test'
import { createUser, deleteUser } from './test-utils'

test.setTimeout(35e3)

test.describe('user related', async () => {
    test('user edits his profile', async ({ page, request }) => {
        await page.goto('/')
        const privateKey = randomBytes(32).toString('hex')

        const key = await createUser(page, privateKey, request)
        const publicKeyContainer = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyText = await publicKeyContainer?.innerText()

        expect(publicKeyText.slice(0, 24)).toBe(key.slice(0, 24))

        await page.click('id=button-edit-profile')

        const targetName = `ViciousBadger${new Date().getTime().toString().slice(0, 4)}`
        const targetBio = 'Hi i am a new test user.'

        await page.getByLabel('user name').fill(targetName)
        await page.getByLabel('bio').fill(targetBio)
        await page.click('id=edit-profile-submit')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const updatedUserNameText = await page
            .waitForSelector(`id=header-property-userName`)
            .then((value) => value.innerText())

        expect(updatedUserNameText).toBe('@' + targetName)

        const updatedUserBioText = await page.waitForSelector(`id=user-bio-display`).then((value) => value.innerText())

        expect(updatedUserBioText).toBe(targetBio)

        await deleteUser(page)
    })
})
