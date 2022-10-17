import { trpc } from '~/utils/trpc'
import { useState } from 'react'
import { Deposit } from '~/components/Deposit'
import { Withdraw } from '~/components/Withdraw'
import { useZodForm } from '~/utils/useZodForm'
import { z } from 'zod'
import { SINGLE_TRANSACTION_CAP } from '~/server/service/constants'

export const createInvoiceInput = z.object({
    amount: z.number().min(1).max(SINGLE_TRANSACTION_CAP),
})

export const Transact = ({}) => {
    const {
        register,
        handleSubmit,
        getValues,
        watch,
        reset,
        formState: { errors },
    } = useZodForm({
        schema: createInvoiceInput,
        defaultValues: {
            amount: 1,
        },
    })

    const [transactMode, setTransactMode] = useState<'none' | 'deposit' | 'withdraw'>('none')

    const { data: myBalance, isLoading: myBalanceIsLoading } = trpc.accounting.myBalance.useQuery()

    return (
        <div>
            {
                {
                    none: (
                        <div className={'flex flex-col items-center gap-4'}>
                            {!myBalanceIsLoading && <div id={'transact-balance-display'}>Balance: {myBalance}</div>}
                            <div className="mb-3 xl:w-96">
                                <form>
                                    <label
                                        htmlFor="transact-invoice-amount-input"
                                        className="form-label mb-2 inline-block text-sm text-gray-700"
                                    >
                                        Invoice amount
                                    </label>
                                    <input
                                        id="transact-invoice-amount-input"
                                        type={'number'}
                                        {...register('amount', { valueAsNumber: true, min: 1, required: true })}
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
                                </form>
                            </div>
                            <div className={'flex w-full flex-row'}>
                                <button
                                    disabled={!!errors.amount}
                                    className="mr-2 mb-2 flex grow flex-col items-center bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:hover:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    onClick={() => setTransactMode('deposit')}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                                        />
                                    </svg>
                                    Deposit
                                </button>
                                <button
                                    className="mr-2 mb-2 flex grow flex-col items-center bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    onClick={() => setTransactMode('withdraw')}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                                        />
                                    </svg>
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    ),
                    deposit: <Deposit amount={getValues('amount')} done={() => setTransactMode('none')} />,
                    withdraw: <Withdraw done={() => setTransactMode('none')} />,
                }[transactMode]
            }
        </div>
    )
}
