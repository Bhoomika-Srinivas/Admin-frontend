export const LIST_ALUMNI = `
  query ListAlumni(
    $search: String,
    $batch: String
  ) {
    listAlumni(
      search: $search,
      batch: $batch
    ) {
      items {
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
      nextToken
    }
  }
`

export const GET_ALUMNI = `
  query GetAlumni($alumniId: ID!) {
    getAlumni(alumniId: $alumniId) {
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

// ─── Alumni Events ────────────────────────────────────────────────────────────

export const LIST_ALUMNI_EVENTS = `
  query ListAlumniEvents(
    $department: String
    $status: String
    $search: String
  ) {
    listAlumniEvents(
      department: $department
      status: $status
      search: $search
    ) {
      items {
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
      nextToken
    }
  }
`

export const GET_ALUMNI_EVENT = `
  query GetAlumniEvent($eventId: ID!) {
    getAlumniEvent(eventId: $eventId) {
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

// ─── Timeline Entries ──────────────────────────────────────────────────────────

export const LIST_TIMELINE_ENTRIES = `
  query ListTimelineEntries {
    listTimelineEntries {
      items {
        entryId
        year
        title
        description
        order
        isActive
      }
      nextToken
    }
  }
`

// ─── Vision Mission ────────────────────────────────────────────────────────────

export const GET_VISION_MISSION = `
  query GetVisionMission {
    getVisionMission {
      documentId
      vision
      mission
      objectives
      updatedAt
    }
  }
`

// ─── Executive Committee ───────────────────────────────────────────────────────

export const LIST_COMMITTEE_MEMBERS = `
  query ListCommitteeMembers {
    listCommitteeMembers {
      items {
        memberId
        name
        roleType
        designation
        department
        organization
        profileImage
        order
      }
      nextToken
    }
  }
`

// ─── Dean Message ────────────────────────────────────────────────────────────

export const GET_DEAN_MESSAGE = `
  query GetDeanMessage {
    getDeanMessage {
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

export const LIST_COORDINATORS = `
  query ListCoordinators(
    $department: String
    $roleType: String
  ) {
    listCoordinators(
      department: $department
      roleType: $roleType
    ) {
      items {
        coordinatorId
        name
        roleType
        department
        email
        isActive
      }
      nextToken
    }
  }
`

// ─── Distinguished Alumni ──────────────────────────────────────────────────────

export const LIST_DISTINGUISHED_ALUMNI = `
  query ListDistinguishedAlumni(
    $department: String
    $featured: Boolean
    $search: String
  ) {
    listDistinguishedAlumni(
      department: $department
      featured: $featured
      search: $search
    ) {
      items {
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
      nextToken
    }
  }
`

// ─── Registration Settings ─────────────────────────────────────────────────────

export const GET_REGISTRATION_SETTINGS = `
  query GetRegistrationSettings {
    getRegistrationSettings {
      settingsId
      title
      description
      registrationLink
    }
  }
`

// ─── Contact Info ──────────────────────────────────────────────────────────────

export const LIST_ALUMNI_CONTACTS = `
  query ListAlumniContacts {
    listAlumniContacts {
      items {
        contactId
        name
        roleType
        department
        designation
        email
      }
      nextToken
    }
  }
`
