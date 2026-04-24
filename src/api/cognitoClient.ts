import { Amplify } from 'aws-amplify'
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  confirmSignIn,
  fetchAuthSession,
} from 'aws-amplify/auth'

// Configure Amplify once on module load
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId:       import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID    as string,
    },
  },
})

// ── Types ─────────────────────────────────────────────────────────────────────

export type LoginStep =
  | { type: 'select_channel'; maskedEmail?: string; maskedPhone?: string; hasEmail: boolean; hasPhone: boolean }
  | { type: 'verify_otp';     channel: string; destination: string }
  | { type: 'done' }

interface StepResult {
  isSignedIn: boolean
  nextStep: {
    signInStep: string
    additionalInfo?: Record<string, string>
  }
}

function parseStep(result: StepResult): LoginStep {
  const { signInStep } = result.nextStep
  if (signInStep === 'DONE') return { type: 'done' }
  if (signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
    const info = result.nextStep.additionalInfo ?? {}
    if (info['step'] === 'SELECT_CHANNEL') {
      return {
        type:        'select_channel',
        maskedEmail: info['maskedEmail'],
        maskedPhone: info['maskedPhone'],
        hasEmail:    info['hasEmail'] === 'true',
        hasPhone:    info['hasPhone'] === 'true',
      }
    }
    if (info['step'] === 'VERIFY_OTP') {
      return {
        type:        'verify_otp',
        channel:     info['channel']     ?? '',
        destination: info['destination'] ?? '',
      }
    }
  }
  throw new Error(`Unexpected sign-in step: ${signInStep}`)
}

// ── Auth operations ───────────────────────────────────────────────────────────

export async function initiateSignIn(email: string, password: string): Promise<LoginStep> {
  const result = await amplifySignIn({
    username: email,
    password,
    options: { authFlowType: 'USER_PASSWORD_AUTH' },
  })
  return parseStep(result as StepResult)
}

export async function selectChannel(channel: 'email' | 'phone'): Promise<LoginStep> {
  const result = await confirmSignIn({
    challengeResponse: channel,
    options: { clientMetadata: { channel } },
  })
  return parseStep(result as StepResult)
}

export async function submitOtp(otp: string): Promise<LoginStep> {
  const result = await confirmSignIn({ challengeResponse: otp })
  return parseStep(result as StepResult)
}

export function signOut(): void {
  amplifySignOut().catch(() => {})
}

export async function getCurrentSession(): Promise<Record<string, unknown> | null> {
  try {
    const session = await fetchAuthSession()
    if (!session.tokens?.idToken) return null
    return session.tokens.idToken.payload as Record<string, unknown>
  } catch {
    return null
  }
}

export async function getCurrentToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() ?? null
  } catch {
    return null
  }
}
