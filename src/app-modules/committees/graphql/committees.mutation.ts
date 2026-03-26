// TODO: Replace with real GraphQL mutations when backend is ready
export const CREATE_COMMITTEES = `
  mutation CreateCOMMITTEES($input: COMMITTEESInput!) {
    createCOMMITTEES(input: $input) {
      id
    }
  }
`
