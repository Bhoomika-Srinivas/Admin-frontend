// TODO: Replace with real GraphQL mutations when backend is ready
export const CREATE_COURSES = `
  mutation CreateCOURSES($input: COURSESInput!) {
    createCOURSES(input: $input) {
      id
    }
  }
`
