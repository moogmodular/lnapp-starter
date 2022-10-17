import { trpc } from '~/utils/trpc'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'

export const TransactionList = ({}) => {
    const { data: transactionData } = trpc.accounting.transactions.useQuery()

    return (
        <div className={'no-scrollbar max-h-600 overflow-y-scroll'}>
            <div>My transactions:</div>
            {transactionData
                ? transactionData.map((transaction) => {
                      return (
                          <div
                              key={transaction.id}
                              className={
                                  'my-2 flex flex-row rounded-tl-lg border-2 border-gray-400 p-1 text-sm transition duration-150 ease-in-out hover:-translate-y-1 hover:drop-shadow-lg'
                              }
                          >
                              <div className={'w-80'}>
                                  <div>
                                      <b>id:</b>
                                      {transaction.id}
                                  </div>
                                  <div className={'flex flex-row gap-1'}>
                                      <div>
                                          <b>amount:</b>
                                          {transaction.mSatsTarget}
                                      </div>
                                      <div>
                                          <b>status:</b>
                                          {transaction.transactionStatus}
                                      </div>
                                  </div>
                              </div>
                              <div>
                                  <div>
                                      <b>kind:</b>
                                      {transaction.transactionKind}
                                  </div>
                                  <div>
                                      <b>created:</b>
                                      {format(transaction.createdAt ?? 0, standardDateFormat)}
                                  </div>
                              </div>
                          </div>
                      )
                  })
                : 'you do not have any transactions yet...'}
        </div>
    )
}
