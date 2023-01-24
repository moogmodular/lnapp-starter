import { trpc } from '~/utils/trpc'
import { useState } from 'react'
import { Deposit } from '~/components/Deposit'
import { Withdraw } from '~/components/Withdraw'
import { useZodForm } from '~/utils/useZodForm'
import { z } from 'zod'
import { SINGLE_TRANSACTION_CAP } from '~/server/service/constants'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import { Button, TextField } from '@mui/material'
import CallMadeIcon from '@mui/icons-material/CallMade'
import CallReceivedIcon from '@mui/icons-material/CallReceived'

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
                                <TextField
                                    fullWidth
                                    error={Boolean(errors.amount)}
                                    label="Invoice amount"
                                    helperText={errors.amount && errors.amount.message}
                                    id="transact-invoice-amount-input"
                                    type={'number'}
                                    {...register('amount', {
                                        valueAsNumber: true,
                                        min: 0,
                                        required: true,
                                    })}
                                />
                            </div>
                            <div className={'flex w-full flex-row justify-between'}>
                                <Button
                                    id={'transact-deposit-button'}
                                    variant={'contained'}
                                    component="label"
                                    disabled={!!errors.amount}
                                    onClick={() => setTransactMode('deposit')}
                                    startIcon={
                                        <>
                                            <AccountBalanceIcon />
                                            <CallReceivedIcon />
                                        </>
                                    }
                                >
                                    Deposit
                                </Button>
                                <Button
                                    id={'transact-deposit-button'}
                                    variant={'contained'}
                                    component="label"
                                    disabled={!!errors.amount}
                                    onClick={() => setTransactMode('withdraw')}
                                    startIcon={
                                        <>
                                            <AccountBalanceIcon />
                                            <CallMadeIcon />
                                        </>
                                    }
                                >
                                    Withdraw
                                </Button>
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
