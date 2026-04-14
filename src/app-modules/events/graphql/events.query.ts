export const LIST_EVENTS = /* GraphQL */ `
  query ListEvents(
    $level: String
    $department: String
    $status: String
    $approvalStatus: String
    $limit: Int
    $nextToken: String
  ) {
    listEvents(
      level: $level
      department: $department
      status: $status
      approvalStatus: $approvalStatus
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        eventId
        title
        isMultiDay
        date
        time
        startDate
        startTime
        endDate
        endTime
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
      }
      nextToken
    }
  }
`

export const GET_EVENT = /* GraphQL */ `
  query GetEvent($eventId: ID!) {
    getEvent(eventId: $eventId) {
      eventId
      title
      isMultiDay
      date
      time
      startDate
      startTime
      endDate
      endTime
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
    }
  }
`
