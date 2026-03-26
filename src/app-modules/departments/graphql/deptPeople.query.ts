export const LIST_DEPT_STAFF = `
  query ListDeptStaff($deptId: ID!, $staffType: String, $limit: Int, $nextToken: String) {
    listDeptStaff(deptId: $deptId, staffType: $staffType, limit: $limit, nextToken: $nextToken) {
      items {
        deptStaffId
        deptId
        name
        designation
        staffType
        imageUrl
        order
      }
      nextToken
    }
  }
`

export const LIST_ACCREDITATIONS = `
  query ListAccreditations($deptId: ID!, $status: String, $limit: Int, $nextToken: String) {
    listAccreditations(deptId: $deptId, status: $status, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`

export const LIST_COMMITTEE_MEMBERS = `
  query ListCommitteeMembers($deptId: ID!, $committee: String) {
    listCommitteeMembers(deptId: $deptId, committee: $committee) {
      items {
        committeeMemberId
        deptId
        committee
        name
        designation
        order
      }
    }
  }
`
