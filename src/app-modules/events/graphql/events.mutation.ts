const EVENT_FIELDS = `
  eventId
  title
  date
  time
  venue
  description
  images
  pinned
  level
  department
  status
  approvalStatus
  createdBy
  createdAt
`

export const CREATE_EVENT = /* GraphQL */ `
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) { ${EVENT_FIELDS} }
  }
`

export const UPDATE_EVENT = /* GraphQL */ `
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) { ${EVENT_FIELDS} }
  }
`

export const DELETE_EVENT = /* GraphQL */ `
  mutation DeleteEvent($eventId: ID!) {
    deleteEvent(eventId: $eventId) { eventId }
  }
`

export const APPROVE_EVENT = /* GraphQL */ `
  mutation ApproveEvent($eventId: ID!) {
    approveEvent(eventId: $eventId) { ${EVENT_FIELDS} }
  }
`

export const REJECT_EVENT = /* GraphQL */ `
  mutation RejectEvent($eventId: ID!) {
    rejectEvent(eventId: $eventId) { ${EVENT_FIELDS} }
  }
`

export const CANCEL_EVENT = /* GraphQL */ `
  mutation CancelEvent($eventId: ID!) {
    cancelEvent(eventId: $eventId) { ${EVENT_FIELDS} }
  }
`

export const TOGGLE_PIN_EVENT = /* GraphQL */ `
  mutation TogglePinEvent($eventId: ID!) {
    togglePinEvent(eventId: $eventId) { ${EVENT_FIELDS} }
  }
`
