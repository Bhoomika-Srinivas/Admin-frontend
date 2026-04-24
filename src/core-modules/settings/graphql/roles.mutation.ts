export const SET_ROLE_PERMISSIONS = `
  mutation SetRolePermissions($role_id: String!, $permissions: [String!]!) {
    setRolePermissions(role_id: $role_id, permissions: $permissions) {
      success
      message
    }
  }
`
