export const LIST_USERS = `
  query ListUsers {
    listUsers {
      items {
        user_id
        name
        email
        phone
        status
        role
        department
        created_at
      }
      nextCursor
    }
  }
`

export const GET_USER = `
  query GetUser($user_id: ID!) {
    getUser(user_id: $user_id) {
      user_id
      name
      email
      phone
      status
      role
      department
      created_at
    }
  }
`
