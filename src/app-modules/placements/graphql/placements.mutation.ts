// TODO: Replace with real GraphQL mutations when backend is ready
export const CREATE_PLACEMENTS = `
  mutation CreatePLACEMENTS($input: PLACEMENTSInput!) {
    createPLACEMENTS(input: $input) {
      id
    }
  }
`
