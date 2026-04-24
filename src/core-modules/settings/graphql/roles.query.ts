export const LIST_ROLES = `
  query ListRoles {
    listRoles {
      role_id
      name
      permissions
    }
  }
`

export const LIST_ALL_PERMISSIONS = `
  query ListAllPermissions {
    listAllPermissions
  }
`
