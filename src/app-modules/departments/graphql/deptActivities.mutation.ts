// src/app-modules/departments/graphql/deptActivities.mutation.ts

// ── Placement Overview ────────────────────────────────────────────────────────

export const CREATE_PLACEMENT_OVERVIEW = /* GraphQL */ `
  mutation CreatePlacementOverview($input: CreatePlacementOverviewInput!) {
    createPlacementOverview(input: $input) {
      placementOverviewId
      deptId
      academicYear
      companiesVisited
      studentsInCampus
      studentsOffCampus
      highestPackage
    }
  }
`

export const UPDATE_PLACEMENT_OVERVIEW = /* GraphQL */ `
  mutation UpdatePlacementOverview($input: UpdatePlacementOverviewInput!) {
    updatePlacementOverview(input: $input) {
      placementOverviewId
      deptId
      academicYear
      companiesVisited
      studentsInCampus
      studentsOffCampus
      highestPackage
    }
  }
`

export const DELETE_PLACEMENT_OVERVIEW = /* GraphQL */ `
  mutation DeletePlacementOverview($placementOverviewId: ID!) {
    deletePlacementOverview(placementOverviewId: $placementOverviewId) {
      placementOverviewId
    }
  }
`

// ── Student Placement ─────────────────────────────────────────────────────────

export const CREATE_STUDENT_PLACEMENT = /* GraphQL */ `
  mutation CreateStudentPlacement($input: CreateStudentPlacementInput!) {
    createStudentPlacement(input: $input) {
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
  }
`

export const UPDATE_STUDENT_PLACEMENT = /* GraphQL */ `
  mutation UpdateStudentPlacement($input: UpdateStudentPlacementInput!) {
    updateStudentPlacement(input: $input) {
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
  }
`

export const DELETE_STUDENT_PLACEMENT = /* GraphQL */ `
  mutation DeleteStudentPlacement($studentPlacementId: ID!) {
    deleteStudentPlacement(studentPlacementId: $studentPlacementId) {
      studentPlacementId
    }
  }
`

// ── Achievement ───────────────────────────────────────────────────────────────

export const CREATE_ACHIEVEMENT = /* GraphQL */ `
  mutation CreateAchievement($input: CreateAchievementInput!) {
    createAchievement(input: $input) {
      achievementId
      deptId
      type
      text
    }
  }
`

export const UPDATE_ACHIEVEMENT = /* GraphQL */ `
  mutation UpdateAchievement($input: UpdateAchievementInput!) {
    updateAchievement(input: $input) {
      achievementId
      deptId
      type
      text
    }
  }
`

export const DELETE_ACHIEVEMENT = /* GraphQL */ `
  mutation DeleteAchievement($achievementId: ID!) {
    deleteAchievement(achievementId: $achievementId) {
      achievementId
    }
  }
`

// ── DeptActivity ──────────────────────────────────────────────────────────────

export const CREATE_DEPT_ACTIVITY = /* GraphQL */ `
  mutation CreateDeptActivity($input: CreateDeptActivityInput!) {
    createDeptActivity(input: $input) {
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
  }
`

export const UPDATE_DEPT_ACTIVITY = /* GraphQL */ `
  mutation UpdateDeptActivity($input: UpdateDeptActivityInput!) {
    updateDeptActivity(input: $input) {
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
  }
`

export const DELETE_DEPT_ACTIVITY = /* GraphQL */ `
  mutation DeleteDeptActivity($deptActivityId: ID!) {
    deleteDeptActivity(deptActivityId: $deptActivityId) {
      deptActivityId
    }
  }
`

// ── Forum Section (upsert) ────────────────────────────────────────────────────

export const SAVE_FORUM_SECTION = /* GraphQL */ `
  mutation SaveForumSection($input: SaveForumSectionInput!) {
    saveForumSection(input: $input) {
      deptId
      title
      description
    }
  }
`

// ── Forum Event ───────────────────────────────────────────────────────────────

export const CREATE_FORUM_EVENT = /* GraphQL */ `
  mutation CreateForumEvent($input: CreateForumEventInput!) {
    createForumEvent(input: $input) {
      forumEventId
      deptId
      title
      description
      attachmentUrl
      createdAt
    }
  }
`

export const UPDATE_FORUM_EVENT = /* GraphQL */ `
  mutation UpdateForumEvent($input: UpdateForumEventInput!) {
    updateForumEvent(input: $input) {
      forumEventId
      deptId
      title
      description
      attachmentUrl
      createdAt
    }
  }
`

export const DELETE_FORUM_EVENT = /* GraphQL */ `
  mutation DeleteForumEvent($forumEventId: ID!) {
    deleteForumEvent(forumEventId: $forumEventId) {
      forumEventId
    }
  }
`

// ── Department Activity ───────────────────────────────────────────────────────

export const CREATE_DEPARTMENT_ACTIVITY = /* GraphQL */ `
  mutation CreateDepartmentActivity($input: CreateDepartmentActivityInput!) {
    createDepartmentActivity(input: $input) {
      deptActivityLogId
      deptId
      text
      createdAt
    }
  }
`

export const UPDATE_DEPARTMENT_ACTIVITY = /* GraphQL */ `
  mutation UpdateDepartmentActivity($input: UpdateDepartmentActivityInput!) {
    updateDepartmentActivity(input: $input) {
      deptActivityLogId
      deptId
      text
      createdAt
    }
  }
`

export const DELETE_DEPARTMENT_ACTIVITY = /* GraphQL */ `
  mutation DeleteDepartmentActivity($deptActivityLogId: ID!) {
    deleteDepartmentActivity(deptActivityLogId: $deptActivityLogId) {
      deptActivityLogId
    }
  }
`

// ── Newsletter ────────────────────────────────────────────────────────────────

export const CREATE_NEWSLETTER = /* GraphQL */ `
  mutation CreateNewsletter($input: CreateNewsletterInput!) {
    createNewsletter(input: $input) {
      newsletterId
      deptId
      year
      fileUrl
    }
  }
`

export const UPDATE_NEWSLETTER = /* GraphQL */ `
  mutation UpdateNewsletter($input: UpdateNewsletterInput!) {
    updateNewsletter(input: $input) {
      newsletterId
      deptId
      year
      fileUrl
    }
  }
`

export const DELETE_NEWSLETTER = /* GraphQL */ `
  mutation DeleteNewsletter($newsletterId: ID!) {
    deleteNewsletter(newsletterId: $newsletterId) {
      newsletterId
    }
  }
`

// ── Gallery Photo ─────────────────────────────────────────────────────────────

export const CREATE_GALLERY_PHOTO = /* GraphQL */ `
  mutation CreateGalleryPhoto($input: CreateGalleryPhotoInput!) {
    createGalleryPhoto(input: $input) {
      galleryPhotoId
      deptId
      title
      category
      imageUrl
      capturedAt
      uploadedAt
    }
  }
`

export const UPDATE_GALLERY_PHOTO = /* GraphQL */ `
  mutation UpdateGalleryPhoto($input: UpdateGalleryPhotoInput!) {
    updateGalleryPhoto(input: $input) {
      galleryPhotoId
      deptId
      title
      category
      imageUrl
      capturedAt
      uploadedAt
    }
  }
`

export const DELETE_GALLERY_PHOTO = /* GraphQL */ `
  mutation DeleteGalleryPhoto($galleryPhotoId: ID!) {
    deleteGalleryPhoto(galleryPhotoId: $galleryPhotoId) {
      galleryPhotoId
    }
  }
`
