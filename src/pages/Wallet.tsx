import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useUserStore } from '../store/userStore'
import { WithdrawalMethod } from '../types'
import {
  Wallet as WalletIcon,
  CreditCard,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  createWithdrawalRequest,
  getWithdrawalRequests,
} from '../services/withdrawalService'

interface WithdrawalRequest {
  id: string
  amount_points: number
  amount_usd: number
  method: string
  status: string
  created_at: string
}

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

export default function Wallet() {
  const { user, loadUser } = useUserStore()

  const [selectedMethod, setSelectedMethod] =
    useState<WithdrawalMethod | null>(null)

  const [amount, setAmount] = useState('')
  const [accountDetails, setAccountDetails] =
    useState('')

  const [submitting, setSubmitting] =
    useState(false)

  const [message, setMessage] =
    useState<string | null>(null)

  const [withdrawals, setWithdrawals] =
    useState<WithdrawalRequest[]>([])

  const [loadingWithdrawals, setLoadingWithdrawals] =
    useState(true)

  const loadWithdrawals = async () => {
    if (!user) {
      setLoadingWithdrawals(false)
      return
    }

    try {
      setLoadingWithdrawals(true)

      const data =
        await getWithdrawalRequests(user.id)

      setWithdrawals(data)
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to load withdrawals',
        error
      )
    } finally {
      setLoadingWithdrawals(false)
    }
  }

  useEffect(() => {
    loadWithdrawals()
  }, [user])

  if (!user) return null

  const selectedAmount = Number(amount)

  const getAccountLabel = () => {
    switch (selectedMethod?.id) {
      case 'baridimob':
        return 'BaridiMob account number'

      case 'paypal':
        return 'PayPal email'

      case 'visa':
        return 'Visa payout details'

      case 'usdt-ton':
        return 'USDT TON wallet address'

      default:
        return 'Account details'
    }
  }

  const getPlaceholder = () => {
    switch (selectedMethod?.id) {
      case 'baridimob':
        return 'Enter BaridiMob account number'

      case 'paypal':
        return 'name@example.com'

      case 'visa':
        return 'Enter Visa payout details (no CVV/PIN)'

      case 'usdt-ton':
        return 'Enter TON wallet address'

      default:
        return 'Enter your details'
    }
  }

  const submitWithdrawal = async () => {
    setMessage(null)

    if (!selectedMethod) {
      setMessage('Please select a withdrawal method.')
      return
    }

    if (
      !Number.isInteger(selectedAmount) ||
      selectedAmount < selectedMethod.minAmount
    ) {
      setMessage(
        `Minimum withdrawal is ${selectedMethod.minAmount.toLocaleString()} points.`
      )
      return
    }

    if (selectedAmount > user.points) {
      setMessage('Insufficient points balance.')
      return
    }

    if (selectedAmount > selectedMethod.maxAmount) {
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
        }
      )

      // Refresh the real balance from Supabase.
      // The backend handles the actual points deduction.
      await loadUser()

      await loadWithdrawals()

      setMessage(
        'Withdrawal request submitted successfully.'
      )

      setAmount('')
      setAccountDetails('')
      setSelectedMethod(null)
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to submit withdrawal',
        error
      )

      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to submit withdrawal request.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'processing':
        return 'Processing'
      case 'completed':
        return 'Completed'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'rejected':
        return 'text-red-400'
      case 'processing':
        return 'text-yellow-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">

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
                        Minimum:{' '}
                        {method.minAmount.toLocaleString()} pts
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setMessage(null)
                      setSelectedMethod(method)
                    }}
                  >
                    <CreditCard className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {selectedMethod && (
          <Card gradient>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Withdraw via {selectedMethod.name}
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod(null)
                    setMessage(null)
                  }}
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
                    user.points
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
                    setAccountDetails(event.target.value)
                  }
                  placeholder={getPlaceholder()}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                {selectedMethod.id === 'visa' && (
                  <p className="text-xs text-yellow-500 mt-2">
                    Never enter your CVV, PIN, password, or
                    other secret security codes.
                  </p>
                )}
              </div>

              {amount && (
                <div className="rounded-xl bg-slate-900 p-3">
                  <p className="text-xs text-slate-400">
                    Withdrawal value
                  </p>

                  <p className="text-lg font-semibold text-green-400">
                    ${(selectedAmount / 1000).toFixed(2)}
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

        <div>
          <h3 className="text-lg font-bold text-white mb-3">
            Withdrawal History
          </h3>

          {loadingWithdrawals ? (
            <Card>
              <p className="text-slate-400 text-sm text-center">
                Loading withdrawals...
              </p>
            </Card>
          ) : withdrawals.length === 0 ? (
            <Card>
              <p className="text-slate-400 text-sm text-center">
                No withdrawal requests yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {withdrawal.method}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {withdrawal.amount_points.toLocaleString()} pts
                        {' • '}
                        ${Number(
                          withdrawal.amount_usd
                        ).toFixed(2)}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(
                          withdrawal.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-semibold ${getStatusClass(
                        withdrawal.status
                      )}`}
                    >
                      {getStatusText(
                        withdrawal.status
                      )}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}
