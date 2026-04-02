// src/app-modules/departments/graphql/deptActivities.query.ts

export const LIST_PLACEMENT_OVERVIEWS = /* GraphQL */ `
  query ListPlacementOverviews($deptId: ID!, $academicYear: String) {
    listPlacementOverviews(deptId: $deptId, academicYear: $academicYear) {
      items {
        placementOverviewId
        deptId
        academicYear
        companiesVisited
        studentsInCampus
        studentsOffCampus
        highestPackage
      }
    }
  }
`

export const LIST_STUDENT_PLACEMENTS = /* GraphQL */ `
  query ListStudentPlacements($deptId: ID!, $batch: String, $limit: Int, $nextToken: String) {
    listStudentPlacements(deptId: $deptId, batch: $batch, limit: $limit, nextToken: $nextToken) {
      items {
        studentPlacementId
        deptId
        studentName
        usn
        batch
        company
        role
        package
        imageUrl
      }
      nextToken
    }
  }
`

export const LIST_ACHIEVEMENTS = /* GraphQL */ `
  query ListAchievements($deptId: ID!, $type: String) {
    listAchievements(deptId: $deptId, type: $type) {
      items {
        achievementId
        deptId
        type
        text
      }
    }
  }
`

export const LIST_DEPT_ACTIVITIES = /* GraphQL */ `
  query ListDeptActivities($deptId: ID!, $type: String, $limit: Int, $nextToken: String) {
    listDeptActivities(deptId: $deptId, type: $type, limit: $limit, nextToken: $nextToken) {
      items {
        deptActivityId
        deptId
        type
        name
        description
        date
        venue
        organizer
        participants
      }
      nextToken
    }
  }
`

export const GET_FORUM_SECTION = /* GraphQL */ `
  query GetForumSection($deptId: ID!) {
    getForumSection(deptId: $deptId) {
      deptId
      title
      description
    }
  }
`

export const LIST_FORUM_EVENTS = /* GraphQL */ `
  query ListForumEvents($deptId: ID!, $limit: Int, $nextToken: String) {
    listForumEvents(deptId: $deptId, limit: $limit, nextToken: $nextToken) {
      items {
        forumEventId
        deptId
        title
        description
        attachmentUrl
        createdAt
      }
      nextToken
    }
  }
`

export const LIST_DEPARTMENT_ACTIVITIES = /* GraphQL */ `
  query ListDepartmentActivities($deptId: ID!, $limit: Int, $nextToken: String) {
    listDepartmentActivities(deptId: $deptId, limit: $limit, nextToken: $nextToken) {
      items {
        deptActivityLogId
        deptId
        text
        createdAt
      }
      nextToken
    }
  }
`

export const LIST_NEWSLETTERS = /* GraphQL */ `
  query ListNewsletters($deptId: ID!) {
    listNewsletters(deptId: $deptId) {
      items {
        newsletterId
        deptId
        year
        fileUrl
      }
    }
  }
`

export const LIST_GALLERY_PHOTOS = /* GraphQL */ `
  query ListGalleryPhotos($deptId: ID!, $category: String, $limit: Int, $nextToken: String) {
    listGalleryPhotos(deptId: $deptId, category: $category, limit: $limit, nextToken: $nextToken) {
      items {
        galleryPhotoId
        deptId
        title
        category
        imageUrl
        capturedAt
        uploadedAt
      }
      nextToken
    }
  }
`
