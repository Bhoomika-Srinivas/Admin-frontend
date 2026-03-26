// TODO: Replace with real GraphQL mutations when backend is ready
export const CREATE_USERS = `
  mutation CreateUSERS($input: USERSInput!) {
    createUSERS(input: $input) {
      id
    }
  }
`
