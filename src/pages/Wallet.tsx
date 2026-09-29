import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import Card from '../components/common/Card'
import TransactionItem from '../components/wallet/TransactionItem'
import Button from '../components/common/Button'
import { useUserStore } from '../store/userStore'
import { Transaction, WithdrawalMethod } from '../types'
import { Wallet as WalletIcon, CreditCard } from 'lucide-react'

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earn',
    amount: 500,
    description: 'Completed task',
    date: new Date(),
    status: 'completed',
  },
  {
    id: '2',
    type: 'earn',
    amount: 300,
    description: 'Watched ad',
    date: new Date(Date.now() - 86400000),
    status: 'completed',
  },
  {
    id: '3',
    type: 'withdraw',
    amount: 5000,
    description: 'Withdrawal to Paypal',
    date: new Date(Date.now() - 172800000),
    status: 'completed',
  },
  {
    id: '4',
    type: 'bonus',
    amount: 1000,
    description: 'Referral bonus',
    date: new Date(Date.now() - 259200000),
    status: 'completed',
  },
]

const withdrawalMethods: WithdrawalMethod[] = [
  {
    id: '1',
    name: 'PayPal',
    icon: '💳',
    minAmount: 1000,
    maxAmount: 1000000,
    fee: 0,
  },
  {
    id: '2',
    name: 'Bank Transfer',
    icon: '🏦',
    minAmount: 5000,
    maxAmount: 5000000,
    fee: 100,
  },
  {
    id: '3',
    name: 'Cryptocurrency',
    icon: '₿',
    minAmount: 2000,
    maxAmount: 2000000,
    fee: 50,
  },
]

export default function Wallet() {
  const { user } = useUserStore()

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Balance Overview */}
        <Card gradient>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Available Balance</p>
                <h2 className="text-3xl font-bold text-white mt-1">
                  {user.points.toLocaleString()}
                </h2>
              </div>
              <WalletIcon className="w-10 h-10 text-blue-400" />
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-slate-400 text-xs">USD Equivalent</p>
              <p className="text-lg font-semibold text-green-400 mt-1">
                ${user.usdEquivalent.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Withdrawal Methods */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Withdrawal Methods</h3>
          <div className="space-y-3">
            {withdrawalMethods.map((method) => (
              <Card key={method.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{method.icon}</div>
                    <div>
                      <p className="font-semibold text-white">{method.name}</p>
                      <p className="text-xs text-slate-400">
                        Min: {method.minAmount.toLocaleString()} | Fee: {method.fee}pts
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="primary">
                    <CreditCard className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Transaction History</h3>
          <div className="space-y-2">
            {mockTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  )
}
