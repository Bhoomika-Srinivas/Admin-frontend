import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js'

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID

if (!USER_POOL_ID || !CLIENT_ID) {
  throw new Error(
    'Cognito configuration missing. ' +
    'Please set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in your .env file'
  )
}

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
})

export function signIn(email: string, password: string): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool })
    user.setAuthenticationFlowType('USER_PASSWORD_AUTH')
    const authDetails = new AuthenticationDetails({ Username: email, Password: password })
    user.authenticateUser(authDetails, {
      onSuccess: resolve,
      onFailure: reject,
    })
  })
}

export function signOut(): void {
  userPool.getCurrentUser()?.signOut()
}

export function getCurrentSession(): Promise<CognitoUserSession | null> {
  return new Promise(resolve => {
    const user = userPool.getCurrentUser()
    if (!user) return resolve(null)
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) return resolve(null)
      resolve(session)
    })
  })
}

export async function getCurrentToken(): Promise<string | null> {
  const session = await getCurrentSession()
  return session ? session.getIdToken().getJwtToken() : null
}
