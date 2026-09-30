import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import Card from '../components/common/Card'
import TransactionItem from '../components/wallet/TransactionItem'
import Button from '../components/common/Button'
import { useUserStore } from '../store/userStore'
import { Transaction, WithdrawalMethod } from '../types'
import { Wallet as WalletIcon, CreditCard, X } from 'lucide-react'
import { useState } from 'react'
import { createWithdrawalRequest } from '../services/withdrawalService'

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

const transactions: Transaction[] = []

export default function Wallet() {
  const { user, updatePoints } = useUserStore()

  const [selectedMethod, setSelectedMethod] =
    useState<WithdrawalMethod | null>(null)

  const [amount, setAmount] = useState('')
  const [accountDetails, setAccountDetails] =
    useState('')

  const [submitting, setSubmitting] =
    useState(false)

  const [message, setMessage] =
    useState<string | null>(null)

  if (!user) return null

  const selectedAmount = Number(amount)

  const getAccountLabel = () => {
    if (!selectedMethod) return 'Account details'

    switch (selectedMethod.id) {
      case 'baridimob':
        return 'BaridiMob account number'

      case 'paypal':
        return 'PayPal email'

      case 'visa':
        return 'Visa payment details'

      case 'usdt-ton':
        return 'USDT TON wallet address'

      default:
        return 'Account details'
    }
  }

  const submitWithdrawal = async () => {
    setMessage(null)

    if (!selectedMethod) {
      setMessage('Please select a withdrawal method.')
      return
    }

    if (
      !Number.isFinite(selectedAmount) ||
      selectedAmount < selectedMethod.minAmount
    ) {
      setMessage(
        `Minimum withdrawal is ${selectedMethod.minAmount.toLocaleString()} points.`,
      )
      return
    }

    if (selectedAmount > user.points) {
      setMessage('Insufficient points balance.')
      return
    }

    if (
      selectedAmount > selectedMethod.maxAmount
    ) {
      setMessage('Withdrawal amount is too high.')
      return
    }

    if (!accountDetails.trim()) {
      setMessage('Please enter your account details.')
      return
    }

    try {
      setSubmitting(true)

      await createWithdrawalRequest(
        user.id,
        selectedAmount,
        selectedMethod.id,
        {
          account: accountDetails.trim(),
        },
      )

      updatePoints(
        user.points - selectedAmount,
      )

      setMessage(
        'Withdrawal request submitted successfully.',
      )

      setAmount('')
      setAccountDetails('')
      setSelectedMethod(null)
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to submit withdrawal request.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Balance */}
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
                    onClick={() =>
                      setSelectedMethod(method)
                    }
                  >
                    <CreditCard className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Withdrawal Form */}
        {selectedMethod && (
          <Card gradient>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Withdraw via {selectedMethod.name}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedMethod(null)
                  }
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Amount in points
                </label>

                <input
                  type="number"
                  min={selectedMethod.minAmount}
                  max={Math.min(
                    selectedMethod.maxAmount,
                    user.points,
                  )}
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="1000"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  {getAccountLabel()}
                </label>

                <input
                  type={
                    selectedMethod.id === 'paypal'
                      ? 'email'
                      : 'text'
                  }
                  value={accountDetails}
                  onChange={(event) =>
                    setAccountDetails(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your details"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              {amount && (
                <div className="rounded-xl bg-slate-900 p-3">
                  <p className="text-xs text-slate-400">
                    Withdrawal value
                  </p>

                  <p className="text-lg font-semibold text-green-400">
                    $
                    {(
                      selectedAmount / 1000
                    ).toFixed(2)}
                  </p>
                </div>
              )}

              {message && (
                <div className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
                  {message}
                </div>
              )}

              <Button
                variant="success"
                className="w-full"
                disabled={submitting}
                onClick={submitWithdrawal}
              >
                {submitting
                  ? 'Submitting...'
                  : 'Request Withdrawal'}
              </Button>
            </div>
          </Card>
        )}

        {/* Transaction History */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">
            Transaction History
          </h3>

          {transactions.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-sm text-center">
                No transactions yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
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
