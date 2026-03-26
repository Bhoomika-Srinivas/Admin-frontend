// TODO: Replace with real GraphQL mutations when backend is ready
export const CREATE_NEWS = `
  mutation CreateNEWS($input: NEWSInput!) {
    createNEWS(input: $input) {
      id
    }
  }
`
