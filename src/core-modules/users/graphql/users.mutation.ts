export const INVITE_USER = `
  mutation InviteUser($input: InviteUserInput!) {
    inviteUser(input: $input) {
      success
      message
    }
  }
`

export const UPDATE_USER = `
  mutation UpdateUser($user_id: String!, $input: UpdateUserInput!) {
    updateUser(user_id: $user_id, input: $input) {
      success
      message
    }
  }
`

export const RESET_USER_PASSWORD = `
  mutation ResetUserPassword($user_id: String!) {
    resetUserPassword(user_id: $user_id) {
      success
      message
    }
  }
`
