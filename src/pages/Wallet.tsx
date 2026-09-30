import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import Card from '../components/common/Card'
import TransactionItem from '../components/wallet/TransactionItem'
import Button from '../components/common/Button'
import { useUserStore } from '../store/userStore'
import { Transaction, WithdrawalMethod } from '../types'
import { Wallet as WalletIcon, CreditCard } from 'lucide-react'

const withdrawalMethods: WithdrawalMethod[] = [
  {
    id: 'baridimob',
    name: 'BaridiMob',
    icon: '🏦',
    minAmount: 1000,
    maxAmount: 1000000,
    fee: 0,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '💳',
    minAmount: 1000,
    maxAmount: 1000000,
    fee: 0,
  },
  {
    id: 'visa',
    name: 'Visa',
    icon: '💳',
    minAmount: 1000,
    maxAmount: 1000000,
    fee: 0,
  },
  {
    id: 'usdt-ton',
    name: 'USDT (TON)',
    icon: '🪙',
    minAmount: 1000,
    maxAmount: 1000000,
    fee: 0,
  },
]

const mockTransactions: Transaction[] = []

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
                <p className="text-slate-400 text-sm">
                  Available Balance
                </p>

                <h2 className="text-3xl font-bold text-white mt-1">
                  {user.points.toLocaleString()} pts
                </h2>
              </div>

              <WalletIcon className="w-10 h-10 text-blue-400" />
            </div>

            <div className="pt-3 border-t border-slate-700">
              <p className="text-slate-400 text-xs">
                USD Equivalent
              </p>

              <p className="text-lg font-semibold text-green-400 mt-1">
                ${user.usdEquivalent.toFixed(2)}
              </p>

              <p className="text-slate-500 text-xs mt-1">
                1,000 points = $1
              </p>
            </div>
          </div>
        </Card>

        {/* Withdrawal Methods */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">
            Withdrawal Methods
          </h3>

          <div className="space-y-3">
            {withdrawalMethods.map((method) => (
              <Card key={method.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {method.icon}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {method.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        Minimum: {method.minAmount.toLocaleString()} pts
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                  >
                    <CreditCard className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">
            Transaction History
          </h3>

          {mockTransactions.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-sm text-center">
                No transactions yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {mockTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
