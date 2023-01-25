import { useZodForm } from '~/utils/useZodForm'
import { z } from 'zod'
import { AppRouter } from '~/server/routers/_app'
import { inferProcedureInput } from '@trpc/server'
import { trpc } from '~/utils/trpc'
import Resizer from 'react-image-file-resizer'
import { useState } from 'react'
import { TransactionList } from '~/components/TransactionList'
import { Button, TextField } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CheckIcon from '@mui/icons-material/Check'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'

type EditUserInput = inferProcedureInput<AppRouter['user']['edit']>

export const editUserInput = z.object({
    userName: z.string().max(24).optional(),
    base64EncodedImage: z.string().optional(),
    bio: z.string().max(256).optional(),
    nostrPubKey: z.string().length(64).optional(),
})

interface EditUserProps {
    close: () => void
}

export const EditUser = ({ close }: EditUserProps) => {
    const { user, logout, setStoreToken, setUser } = useStore(authedUserStore)
    const [base64EncodedImage, setBase64EncodedImage] = useState<string | undefined>(user?.profileImage ?? undefined)

    const editUserMutation = trpc.user.edit.useMutation()
    const deleteUserMutation = trpc.user.deleteMe.useMutation()
    const utils = trpc.useContext()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useZodForm({
        schema: editUserInput,
        defaultValues: {
            userName: user?.userName,
            base64EncodedImage: user?.profileImage ?? '',
            bio: user?.bio ?? '',
            nostrPubKey: user?.nostrPubKey ?? '',
        },
    })

    const resizeFile = (file: any) =>
        new Promise<string>((resolve) => {
            Resizer.imageFileResizer(
                file,
                250,
                250,
                'JPEG',
                100,
                0,
                (uri) => {
                    resolve(uri as string)
                },
                'base64',
            )
        })

    const onSubmit = async (data: EditUserInput) => {
        await editUserMutation.mutateAsync({ ...data, base64EncodedImage })
        await utils.invalidate()
        utils.auth.getMe.fetch().then((res) => {
            setUser(res)
        })
        close()
    }

    const handleDeleteClick = async () => {
        await deleteUserMutation.mutateAsync()
        await utils.invalidate()
        logout()
        close()
    }

    return (
        <div className={'flex h-4/6 flex-row gap-8'} onSubmit={handleSubmit(onSubmit)}>
            <form className={'flex flex-col gap-8'} onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="edit-user-profileImage">Profile image</label>
                    <img
                        id={'edit-user-profileImage'}
                        src={base64EncodedImage}
                        alt={`Profile image of ${user?.userName}`}
                    />
                </div>
                <Button variant="contained" component="label">
                    Upload File
                    <input
                        type="file"
                        id="fileupload"
                        onChange={async (e) => {
                            if (e.target.files) {
                                setBase64EncodedImage(await resizeFile(e.target.files[0]))
                            }
                        }}
                    />
                </Button>
                <TextField
                    id="edit-user-userName"
                    label={'user name'}
                    variant="outlined"
                    {...register('userName', { required: true })}
                />
                <TextField
                    id="edit-user-nostrPubKey"
                    label={'nostr pub key'}
                    variant="outlined"
                    {...register('nostrPubKey', { required: false })}
                />
                <TextField
                    multiline
                    id="edit-user-bio"
                    label={'bio'}
                    variant="outlined"
                    {...register('bio', { required: true })}
                />
                <div className={'flex flex-row justify-between'}>
                    <Button
                        id={'edit-profile-delete-user'}
                        component="label"
                        variant="contained"
                        color={'warning'}
                        onClick={handleDeleteClick}
                    >
                        <DeleteForeverIcon />
                        Delete User
                    </Button>
                    <Button id={'edit-profile-submit'} type={'submit'} variant="outlined">
                        <CheckIcon />
                        Submit
                    </Button>
                </div>
            </form>
            <TransactionList />
        </div>
    )
}
