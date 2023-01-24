import { inferProcedureOutput } from '@trpc/server'
import { AppRouter } from '~/server/routers/_app'
import { format } from 'date-fns'
import { standardDateDayFormat, standardDateNumberDayFormat } from '~/utils/date'
import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { trpc } from '~/utils/trpc'
import { Avatar, Button, Divider, TextField } from '@mui/material'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

type UserSingleOutput = inferProcedureOutput<AppRouter['user']['listLatest']>[0]

const DateValue = ({ value, property }: { value: Date | null; property: string }) => {
    return (
        <div className={'flex flex-row'}>
            <div className={'w-24'}>{`${property}`}</div>
            {value ? (
                <div className={'flex flex-row gap-1'}>
                    <p className={'w-20'}>{format(value, standardDateDayFormat)},</p>
                    <p>{format(value, standardDateNumberDayFormat)}</p>
                </div>
            ) : (
                'N/A'
            )}
        </div>
    )
}

export const createTipForUser = z.object({
    amount: z.number().min(1).max(100),
    userName: z.string(),
})

interface UserSingleProps {
    user: UserSingleOutput
}

export const UserSingle = ({ user }: UserSingleProps) => {
    const createTipMutation = trpc.tip.creteTipForUser.useMutation()
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
        schema: createTipForUser,
        defaultValues: {
            userName: user.userName,
            amount: 5,
        },
    })

    const handleCreateTip = async () => {
        await createTipMutation.mutateAsync({ userName: user?.userName, amount: getValues('amount') })
        setValue('amount', 5)
        utils.accounting.invalidate()
    }

    return (
        <>
            <div
                className={
                    'my-2 flex flex-col gap-4 rounded-tl-lg border-2 border-gray-400 p-3 text-sm transition duration-150 ease-in-out hover:-translate-y-1 hover:drop-shadow-lg'
                }
            >
                <div className={'flex flex-row gap-4 text-xs lg:text-base'}>
                    <div className={'flex flex-col'}>
                        <div className={'flex flex-row '}>
                            <b>Public Key:</b>
                            <p className={'break-all'}>{user.publicKey}</p>
                        </div>
                        <Divider />
                        {user.bio && (
                            <div>
                                <div className={'flex flex-row'}>
                                    <b>bio:</b>
                                    <p id={'user-bio-display'}>{user.bio}</p>
                                </div>
                                <Divider />
                            </div>
                        )}
                        {user.nostrPubKey && (
                            <div>
                                <div className={'flex flex-row'}>
                                    <b>Nostr:</b>
                                    <p className={'break-all'}>{user.nostrPubKey}</p>
                                </div>
                                <Divider />
                            </div>
                        )}
                    </div>
                </div>
                <div className={'flex flex-col items-center gap-4 text-xs lg:flex-row lg:text-base'}>
                    <div className={'flex w-full flex-row'}>
                        <Avatar
                            alt={`profile image of ${user.userName}`}
                            src={user.profileImage ?? 'https://picsum.photos/250'}
                            className={'mr-2'}
                        />
                        <div className={'flex w-1/3 grow flex-col text-xs lg:text-base'}>
                            <div>{user.id}</div>
                            <div>@{user.userName}</div>
                        </div>
                        <div className={'hidden flex-col lg:flex'}>
                            <DateValue property={'created at:'} value={user.createdAt} />
                            <DateValue property={'updated at:'} value={user.updatedAt} />
                        </div>
                    </div>
                    <div className={'flex flex-row gap-4'}>
                        <TextField
                            label="tip amount"
                            id="transact-invoice-amount-input"
                            type={'number'}
                            size={'small'}
                            {...register('amount', { required: true, valueAsNumber: true })}
                        />
                        <Button
                            id={'edit-profile-delete-user'}
                            fullWidth={true}
                            component="label"
                            variant="contained"
                            size={'small'}
                            color={'success'}
                            onClick={() => handleCreateTip()}
                            disabled={watch('amount') < 1 || watch('amount') > 100}
                            startIcon={<RocketLaunchIcon />}
                        >
                            Tip user
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
