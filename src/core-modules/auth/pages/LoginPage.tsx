import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { LoginSchema } from '@/core-modules/auth/types'
import clsx from 'clsx'

// ── Step types ────────────────────────────────────────────────────────────────

type Screen = 'credentials' | 'select_channel' | 'verify_otp'

interface ChannelInfo {
  maskedEmail?: string
  maskedPhone?: string
  hasEmail: boolean
  hasPhone: boolean
}

interface OtpInfo {
  channel: string
  destination: string
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { isAuthenticated, initiateLogin, selectChannel, confirmOtp } = useAuth()
  const navigate = useNavigate()

  const [screen,      setScreen]      = useState<Screen>('credentials')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [otp,         setOtp]         = useState('')
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null)
  const [otpInfo,     setOtpInfo]     = useState<OtpInfo | null>(null)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  // ── Step 1 — Credentials ──────────────────────────────────────────────────

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = LoginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
      setError(first ?? 'Please check your input.')
      return
    }

    setLoading(true)
    try {
      const step = await initiateLogin(email, password)
      if (step.type === 'select_channel') {
        setChannelInfo(step)
        setScreen('select_channel')
      } else if (step.type === 'verify_otp') {
        setOtpInfo(step)
        setScreen('verify_otp')
      } else if (step.type === 'done') {
        navigate('/', { replace: true })
      }
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2 — Channel selection ────────────────────────────────────────────

  async function handleSelectChannel(channel: 'email' | 'phone') {
    setError('')
    setLoading(true)
    try {
      const step = await selectChannel(channel)
      if (step.type === 'verify_otp') {
        setOtpInfo(step)
        setScreen('verify_otp')
      }
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3 — OTP verification ─────────────────────────────────────────────

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!otp.trim()) {
      setError('Please enter the OTP.')
      return
    }
    setLoading(true)
    try {
      const step = await confirmOtp(otp.trim())
      if (step.type === 'done') {
        navigate('/', { replace: true })
      } else {
        setError('Invalid OTP. Please try again.')
        setOtp('')
      }
    } catch {
      setError('Invalid OTP. Please try again.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  // ── Shell ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 to-brand-800 px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-display font-bold text-2xl">B</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">BIET Admin</h1>
            <p className="text-brand-200 text-sm mt-1">Management Portal</p>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {screen === 'credentials' && (
              <>
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Sign in to your account</h2>
                <form onSubmit={handleCredentials} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="you@biet.edu"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-field"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                  {error && <ErrorBox message={error} />}
                  <button
                    type="submit"
                    disabled={loading}
                    className={clsx('w-full btn-primary justify-center py-2.5 mt-2', loading && 'opacity-70 cursor-not-allowed')}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>
              </>
            )}

            {screen === 'select_channel' && channelInfo && (
              <>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Verify your identity</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Choose where to send your one-time password.
                </p>
                <div className="space-y-3">
                  {channelInfo.hasEmail && (
                    <button
                      onClick={() => handleSelectChannel('email')}
                      disabled={loading}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50 transition-colors text-left disabled:opacity-60"
                    >
                      <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 text-brand-600 font-bold text-sm">@</div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Email</p>
                        <p className="text-xs text-slate-500">{channelInfo.maskedEmail}</p>
                      </div>
                    </button>
                  )}
                  {channelInfo.hasPhone && (
                    <button
                      onClick={() => handleSelectChannel('phone')}
                      disabled={loading}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50 transition-colors text-left disabled:opacity-60"
                    >
                      <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 text-brand-600 font-bold text-sm">#</div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">SMS</p>
                        <p className="text-xs text-slate-500">{channelInfo.maskedPhone}</p>
                      </div>
                    </button>
                  )}
                </div>
                {error && <div className="mt-4"><ErrorBox message={error} /></div>}
              </>
            )}

            {screen === 'verify_otp' && otpInfo && (
              <>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Enter OTP</h2>
                <p className="text-sm text-slate-500 mb-6">
                  A 6-digit code was sent to <span className="font-medium text-slate-700">{otpInfo.destination}</span>.
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">One-Time Password</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="input-field text-center tracking-widest text-lg font-mono"
                      placeholder="000000"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                  {error && <ErrorBox message={error} />}
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className={clsx('w-full btn-primary justify-center py-2.5 mt-2', (loading || otp.length < 6) && 'opacity-70 cursor-not-allowed')}
                  >
                    {loading ? 'Verifying…' : 'Verify'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      {message}
    </div>
  )
}
