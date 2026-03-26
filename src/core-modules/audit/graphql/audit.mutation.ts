// TODO: Replace with real GraphQL mutations when backend is ready
export const CREATE_AUDIT_LOGS = `
  mutation CreateAUDIT LOGS($input: AUDIT LOGSInput!) {
    createAUDIT LOGS(input: $input) {
      id
    }
  }
`
