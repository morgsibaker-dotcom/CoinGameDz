import { Transaction } from '../../types'
import { ArrowUp, ArrowDown, Clock, CheckCircle, XCircle } from 'lucide-react'

interface TransactionItemProps {
  transaction: Transaction
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === 'earn' || transaction.type === 'bonus'
  const Icon = isIncome ? ArrowUp : ArrowDown

  const statusIcon = {
    completed: <CheckCircle className="w-5 h-5 text-green-400" />,
    pending: <Clock className="w-5 h-5 text-yellow-400" />,
    failed: <XCircle className="w-5 h-5 text-red-400" />,
  }

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isIncome ? 'bg-green-900' : 'bg-red-900'
          }`}
        >
          <Icon className={`w-5 h-5 ${isIncome ? 'text-green-400' : 'text-red-400'}`} />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">
            {transaction.description}
          </p>
          <p className="text-slate-400 text-xs">
            {transaction.date.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-bold text-sm ${
            isIncome ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isIncome ? '+' : '-'}{transaction.amount}
        </span>
        {statusIcon[transaction.status]}
      </div>
    </div>
  )
}
