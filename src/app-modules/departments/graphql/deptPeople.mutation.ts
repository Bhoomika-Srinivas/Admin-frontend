// ── Staff ─────────────────────────────────────────────────────────────────────

export const CREATE_DEPT_STAFF = `
  mutation CreateDeptStaff($input: CreateDeptStaffInput!) {
    createDeptStaff(input: $input) {
      deptStaffId
      deptId
      name
      designation
      staffType
      imageUrl
      order
    }
  }
`

export const UPDATE_DEPT_STAFF = `
  mutation UpdateDeptStaff($input: UpdateDeptStaffInput!) {
    updateDeptStaff(input: $input) {
      deptStaffId
      deptId
      name
      designation
      staffType
      imageUrl
      order
    }
  }
`

export const DELETE_DEPT_STAFF = `
  mutation DeleteDeptStaff($deptStaffId: ID!) {
    deleteDeptStaff(deptStaffId: $deptStaffId) {
      deptStaffId
    }
  }
`

// ── Accreditations ────────────────────────────────────────────────────────────

export const CREATE_ACCREDITATION = `
  mutation CreateAccreditation($input: CreateAccreditationInput!) {
    createAccreditation(input: $input) {
      accreditationId
      deptId
      name
      accreditedBy
      validFrom
      validUntil
      grade
      certificateUrl
      status
    }
  }
`

export const UPDATE_ACCREDITATION = `
  mutation UpdateAccreditation($input: UpdateAccreditationInput!) {
    updateAccreditation(input: $input) {
      accreditationId
      deptId
      name
      accreditedBy
      validFrom
      validUntil
      grade
      certificateUrl
      status
    }
  }
`

export const DELETE_ACCREDITATION = `
  mutation DeleteAccreditation($accreditationId: ID!) {
    deleteAccreditation(accreditationId: $accreditationId) {
      accreditationId
    }
  }
`

// ── Committee Members ─────────────────────────────────────────────────────────

export const CREATE_COMMITTEE_MEMBER = `
  mutation CreateCommitteeMember($input: CreateCommitteeMemberInput!) {
    createCommitteeMember(input: $input) {
      committeeMemberId
      deptId
      committee
      name
      designation
      order
    }
  }
`

export const UPDATE_COMMITTEE_MEMBER = `
  mutation UpdateCommitteeMember($input: UpdateCommitteeMemberInput!) {
    updateCommitteeMember(input: $input) {
      committeeMemberId
      deptId
      committee
      name
      designation
      order
    }
  }
`

export const DELETE_COMMITTEE_MEMBER = `
  mutation DeleteCommitteeMember($committeeMemberId: ID!) {
    deleteCommitteeMember(committeeMemberId: $committeeMemberId) {
      committeeMemberId
    }
  }
`
