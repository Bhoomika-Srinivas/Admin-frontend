export const CREATE_ALUMNI = `
  mutation CreateAlumni($input: CreateAlumniInput!) {
    createAlumni(input: $input) {
      alumniId
      name
      batch
      department
      company
      designation
      location
      email
      linkedin
      image
      createdAt
    }
  }
`

export const UPDATE_ALUMNI = `
  mutation UpdateAlumni($input: UpdateAlumniInput!) {
    updateAlumni(input: $input) {
      alumniId
      name
      batch
      department
      company
      designation
      location
      email
      linkedin
      image
      updatedAt
    }
  }
`

export const DELETE_ALUMNI = `
  mutation DeleteAlumni($alumniId: ID!) {
    deleteAlumni(alumniId: $alumniId) {
      alumniId
    }
  }
`

// ─── Alumni Events ────────────────────────────────────────────────────────────

export const CREATE_ALUMNI_EVENT = `
  mutation CreateAlumniEvent($input: CreateAlumniEventInput!) {
    createAlumniEvent(input: $input) {
      eventId
      title
      date
      time
      department
      location
      description
      image
      status
      createdAt
    }
  }
`

export const UPDATE_ALUMNI_EVENT = `
  mutation UpdateAlumniEvent($input: UpdateAlumniEventInput!) {
    updateAlumniEvent(input: $input) {
      eventId
      title
      date
      time
      department
      location
      description
      image
      status
      updatedAt
    }
  }
`

export const DELETE_ALUMNI_EVENT = `
  mutation DeleteAlumniEvent($eventId: ID!) {
    deleteAlumniEvent(eventId: $eventId) {
      eventId
    }
  }
`

// ─── Timeline Entries ──────────────────────────────────────────────────────────

export const CREATE_TIMELINE_ENTRY = `
  mutation CreateTimelineEntry($input: CreateTimelineEntryInput!) {
    createTimelineEntry(input: $input) {
      entryId
      year
      title
      description
      order
      isActive
    }
  }
`

export const UPDATE_TIMELINE_ENTRY = `
  mutation UpdateTimelineEntry($input: UpdateTimelineEntryInput!) {
    updateTimelineEntry(input: $input) {
      entryId
      year
      title
      description
      order
      isActive
    }
  }
`

export const DELETE_TIMELINE_ENTRY = `
  mutation DeleteTimelineEntry($entryId: ID!) {
    deleteTimelineEntry(entryId: $entryId) {
      entryId
    }
  }
`

export const REORDER_TIMELINE_ENTRIES = `
  mutation ReorderTimelineEntries($orders: [TimelineOrderInput!]!) {
    reorderTimelineEntries(orders: $orders) {
      success
    }
  }
`

// ─── Vision Mission ────────────────────────────────────────────────────────────

export const UPDATE_VISION_MISSION = `
  mutation UpdateVisionMission($input: UpdateVisionMissionInput!) {
    updateVisionMission(input: $input) {
      documentId
      vision
      mission
      objectives
      updatedAt
    }
  }
`

// ─── Executive Committee ───────────────────────────────────────────────────────

export const CREATE_COMMITTEE_MEMBER = `
  mutation CreateCommitteeMember($input: CreateCommitteeMemberInput!) {
    createCommitteeMember(input: $input) {
      memberId
      name
      roleType
      designation
      department
      organization
      profileImage
      order
    }
  }
`

export const UPDATE_COMMITTEE_MEMBER = `
  mutation UpdateCommitteeMember($input: UpdateCommitteeMemberInput!) {
    updateCommitteeMember(input: $input) {
      memberId
      name
      roleType
      designation
      department
      organization
      profileImage
      order
    }
  }
`

export const DELETE_COMMITTEE_MEMBER = `
  mutation DeleteCommitteeMember($memberId: ID!) {
    deleteCommitteeMember(memberId: $memberId) {
      memberId
    }
  }
`

// ─── Dean Message ────────────────────────────────────────────────────────────

export const UPDATE_DEAN_MESSAGE = `
  mutation UpdateDeanMessage($input: UpdateDeanMessageInput!) {
    updateDeanMessage(input: $input) {
      messageId
      name
      role
      department
      designation
      message
      image
      isActive
    }
  }
`

// ─── Coordinators ────────────────────────────────────────────────────────────

export const CREATE_COORDINATOR = `
  mutation CreateCoordinator($input: CreateCoordinatorInput!) {
    createCoordinator(input: $input) {
      coordinatorId
      name
      roleType
      department
      email
      isActive
    }
  }
`

export const UPDATE_COORDINATOR = `
  mutation UpdateCoordinator($input: UpdateCoordinatorInput!) {
    updateCoordinator(input: $input) {
      coordinatorId
      name
      roleType
      department
      email
      isActive
    }
  }
`

export const DELETE_COORDINATOR = `
  mutation DeleteCoordinator($coordinatorId: ID!) {
    deleteCoordinator(coordinatorId: $coordinatorId) {
      coordinatorId
    }
  }
`

// ─── Distinguished Alumni ──────────────────────────────────────────────────────

export const CREATE_DISTINGUISHED_ALUMNUS = `
  mutation CreateDistinguishedAlumnus($input: CreateDistinguishedAlumnusInput!) {
    createDistinguishedAlumnus(input: $input) {
      distinguishedAlumnusId
      name
      department
      batchYear
      currentRole
      company
      linkedinUrl
      profileImage
      isFeatured
      isActive
    }
  }
`

export const UPDATE_DISTINGUISHED_ALUMNUS = `
  mutation UpdateDistinguishedAlumnus($input: UpdateDistinguishedAlumnusInput!) {
    updateDistinguishedAlumnus(input: $input) {
      distinguishedAlumnusId
      name
      department
      batchYear
      currentRole
      company
      linkedinUrl
      profileImage
      isFeatured
      isActive
    }
  }
`

export const DELETE_DISTINGUISHED_ALUMNUS = `
  mutation DeleteDistinguishedAlumnus($distinguishedAlumnusId: ID!) {
    deleteDistinguishedAlumnus(distinguishedAlumnusId: $distinguishedAlumnusId) {
      distinguishedAlumnusId
    }
  }
`

// ─── Registration Settings ─────────────────────────────────────────────────────

export const UPDATE_REGISTRATION_SETTINGS = `
  mutation UpdateRegistrationSettings($input: UpdateRegistrationSettingsInput!) {
    updateRegistrationSettings(input: $input) {
      settingsId
      title
      description
      registrationLink
    }
  }
`

// ─── Contact Info ──────────────────────────────────────────────────────────────

export const CREATE_ALUMNI_CONTACT = `
  mutation CreateAlumniContact($input: CreateAlumniContactInput!) {
    createAlumniContact(input: $input) {
      contactId
      name
      roleType
      department
      designation
      email
    }
  }
`

export const UPDATE_ALUMNI_CONTACT = `
  mutation UpdateAlumniContact($input: UpdateAlumniContactInput!) {
    updateAlumniContact(input: $input) {
      contactId
      name
      roleType
      department
      designation
      email
    }
  }
`

export const DELETE_ALUMNI_CONTACT = `
  mutation DeleteAlumniContact($contactId: ID!) {
    deleteAlumniContact(contactId: $contactId) {
      contactId
    }
  }
`
