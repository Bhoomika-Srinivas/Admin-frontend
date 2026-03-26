// TODO: Replace with real GraphQL mutations when backend is ready
export const CREATE_AUTH = `
  mutation CreateAUTH($input: AUTHInput!) {
    createAUTH(input: $input) {
      id
    }
  }
`
