// TODO: Replace with real GraphQL mutations when backend is ready
export const CREATE_NOTIFICATIONS = `
  mutation CreateNOTIFICATIONS($input: NOTIFICATIONSInput!) {
    createNOTIFICATIONS(input: $input) {
      id
    }
  }
`
