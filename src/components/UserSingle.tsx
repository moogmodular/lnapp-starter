import { inferProcedureOutput } from '@trpc/server'
import { AppRouter } from '~/server/routers/_app'
import { PublicKeyDisplay } from '~/components/PublicKeyDisplay'
import { format } from 'date-fns'
import { standardDateDayFormat, standardDateNumberDayFormat } from '~/utils/date'
import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { trpc } from '~/utils/trpc'
import { tipRouter } from '~/server/routers/tips'

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
                    'my-2 flex flex-row rounded-tl-lg border-2 border-gray-400 p-3 text-sm transition duration-150 ease-in-out hover:-translate-y-1 hover:drop-shadow-lg'
                }
            >
                <img
                    className="mr-2 h-14 w-14"
                    src={user.profileImage ?? 'https://picsum.photos/250'}
                    alt={`profile image of ${user.userName}`}
                />
                <div className={'flex w-full flex-row gap-4'}>
                    <div className={'flex w-1/3 flex-col'}>
                        <div>{user.id}</div>
                        <div>@{user.userName}</div>
                        <div className={'break-all'}>
                            <PublicKeyDisplay publicKey={user.publicKey} />
                        </div>
                    </div>
                    <div className={'flex flex-col'}>
                        <DateValue property={'created at:'} value={user.createdAt} />
                        <DateValue property={'updated at:'} value={user.updatedAt} />
                    </div>
                    <div className={'flex w-1/3 flex-col'}>
                        <b>bio:</b>
                        <p id={'user-bio-display'}>{user.bio}</p>
                    </div>
                </div>
                <div className={'flex flex-row gap-4'}>
                    <div>
                        <label htmlFor="tip-this-user">tip amount</label>
                        <input
                            id={'tip-this-user'}
                            {...register('amount', { required: true, valueAsNumber: true })}
                            type="text"
                            className="
          form-control
          m-0
          block
          w-full
          border
          border-solid
          border-gray-300
          bg-white bg-clip-padding
          px-2 py-1 text-sm
          font-normal
          text-gray-700
          transition
          ease-in-out
          focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none
        "
                        />
                    </div>
                    <button
                        className={
                            'h-12 w-32 rounded-tr-lg border-2 border-gray-400 p-3 text-sm transition duration-150 ease-in-out hover:-translate-y-1 hover:drop-shadow-lg'
                        }
                        onClick={() => handleCreateTip()}
                        disabled={watch('amount') < 1 || watch('amount') > 100}
                    >
                        Tip user
                    </button>
                </div>
            </div>
        </>
    )
}
