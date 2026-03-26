import { gqlRequest } from '@/api/graphqlClient'
import type {
  PlacementOverview,
  StudentPlacement,
  Achievement,
  DeptActivity,
  DeptNewsletter,
  DeptGalleryPhoto,
  ForumSection,
  ForumEvent,
  DepartmentActivity,
} from '@/shared/types/models'

import {
  LIST_PLACEMENT_OVERVIEWS,
  LIST_STUDENT_PLACEMENTS,
  LIST_ACHIEVEMENTS,
  LIST_DEPT_ACTIVITIES,
  GET_FORUM_SECTION,
  LIST_FORUM_EVENTS,
  LIST_DEPARTMENT_ACTIVITIES,
  LIST_NEWSLETTERS,
  LIST_GALLERY_PHOTOS,
} from '../graphql/deptActivities.query'

import {
  CREATE_PLACEMENT_OVERVIEW,
  UPDATE_PLACEMENT_OVERVIEW,
  DELETE_PLACEMENT_OVERVIEW,
  CREATE_STUDENT_PLACEMENT,
  UPDATE_STUDENT_PLACEMENT,
  DELETE_STUDENT_PLACEMENT,
  CREATE_ACHIEVEMENT,
  UPDATE_ACHIEVEMENT,
  DELETE_ACHIEVEMENT,
  CREATE_DEPT_ACTIVITY,
  UPDATE_DEPT_ACTIVITY,
  DELETE_DEPT_ACTIVITY,
  SAVE_FORUM_SECTION,
  CREATE_FORUM_EVENT,
  UPDATE_FORUM_EVENT,
  DELETE_FORUM_EVENT,
  CREATE_DEPARTMENT_ACTIVITY,
  UPDATE_DEPARTMENT_ACTIVITY,
  DELETE_DEPARTMENT_ACTIVITY,
  CREATE_NEWSLETTER,
  UPDATE_NEWSLETTER,
  DELETE_NEWSLETTER,
  CREATE_GALLERY_PHOTO,
  UPDATE_GALLERY_PHOTO,
  DELETE_GALLERY_PHOTO,
} from '../graphql/deptActivities.mutation'

// ── Helpers — map backend primary keys to frontend `id` ──────────────────────

function mapPlacementOverview(r: Record<string, unknown>): PlacementOverview {
  return {
    id:                String(r.placementOverviewId),
    deptId:            String(r.deptId),
    title:             String(r.title ?? ''),
    academicYear:      String(r.academicYear ?? ''),
    companiesVisited:  Number(r.companiesVisited ?? 0),
    studentsInCampus:  Number(r.studentsInCampus ?? 0),
    studentsOffCampus: Number(r.studentsOffCampus ?? 0),
    highestPackage:    String(r.highestPackage ?? ''),
  }
}

function mapStudentPlacement(r: Record<string, unknown>): StudentPlacement {
  return {
    id:          String(r.studentPlacementId),
    deptId:      String(r.deptId),
    studentName: String(r.studentName ?? ''),
    usn:         String(r.usn ?? ''),
    batch:       String(r.batch ?? ''),
    company:     String(r.company ?? ''),
    role:        String(r.role ?? ''),
    package:     Number(r.package ?? 0),
    imageUrl:    r.imageUrl ? String(r.imageUrl) : undefined,
  }
}

function mapAchievement(r: Record<string, unknown>): Achievement {
  return {
    id:     String(r.achievementId),
    deptId: String(r.deptId),
    type:   r.type as 'student' | 'staff',
    text:   String(r.text ?? ''),
  }
}

function mapDeptActivity(r: Record<string, unknown>): DeptActivity {
  return {
    id:           String(r.deptActivityId),
    deptId:       String(r.deptId),
    type:         r.type as 'forum' | 'department',
    name:         String(r.name ?? ''),
    description:  String(r.description ?? ''),
    date:         String(r.date ?? ''),
    venue:        String(r.venue ?? ''),
    organizer:    String(r.organizer ?? ''),
    participants: r.participants != null ? Number(r.participants) : undefined,
  }
}

function mapForumSection(r: Record<string, unknown>): ForumSection {
  return {
    id:          String(r.deptId), // singleton — use deptId as surrogate id
    deptId:      String(r.deptId),
    title:       String(r.title ?? ''),
    description: String(r.description ?? ''),
  }
}

function mapForumEvent(r: Record<string, unknown>): ForumEvent {
  return {
    id:          String(r.forumEventId),
    deptId:      String(r.deptId),
    title:       String(r.title ?? ''),
    description: String(r.description ?? ''),
    createdAt:   String(r.createdAt ?? ''),
  }
}

function mapDepartmentActivity(r: Record<string, unknown>): DepartmentActivity {
  return {
    id:        String(r.deptActivityLogId),
    deptId:    String(r.deptId),
    text:      String(r.text ?? ''),
    createdAt: String(r.createdAt ?? ''),
  }
}

function mapNewsletter(r: Record<string, unknown>): DeptNewsletter {
  return {
    id:            String(r.newsletterId),
    deptId:        String(r.deptId),
    title:         String(r.title ?? ''),
    volume:        String(r.volume ?? ''),
    issue:         String(r.issue ?? ''),
    publishedDate: String(r.publishedDate ?? ''),
    fileUrl:       String(r.fileUrl ?? ''),
  }
}

function mapGalleryPhoto(r: Record<string, unknown>): DeptGalleryPhoto {
  return {
    id:         String(r.galleryPhotoId),
    deptId:     String(r.deptId),
    title:      String(r.title ?? ''),
    category:   String(r.category ?? ''),
    imageUrl:   String(r.imageUrl ?? ''),
    capturedAt: String(r.capturedAt ?? ''),
    uploadedAt: String(r.uploadedAt ?? ''),
  }
}

// ── Placement Overview ────────────────────────────────────────────────────────

export const placementOverviewService = {
  async getAll(deptId: string, academicYear?: string): Promise<PlacementOverview[]> {
    const data = await gqlRequest<{ listPlacementOverviews: { items: Record<string, unknown>[] } }>(
      LIST_PLACEMENT_OVERVIEWS,
      { deptId, ...(academicYear ? { academicYear } : {}) },
    )
    return (data.listPlacementOverviews?.items ?? []).map(mapPlacementOverview)
  },

  async create(input: Omit<PlacementOverview, 'id'>): Promise<PlacementOverview> {
    const data = await gqlRequest<{ createPlacementOverview: Record<string, unknown> }>(
      CREATE_PLACEMENT_OVERVIEW,
      { input },
    )
    return mapPlacementOverview(data.createPlacementOverview)
  },

  async update(id: string, patch: Partial<Omit<PlacementOverview, 'id'>>): Promise<PlacementOverview> {
    const data = await gqlRequest<{ updatePlacementOverview: Record<string, unknown> }>(
      UPDATE_PLACEMENT_OVERVIEW,
      { input: { placementOverviewId: id, ...patch } },
    )
    return mapPlacementOverview(data.updatePlacementOverview)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_PLACEMENT_OVERVIEW, { placementOverviewId: id })
  },
}

// ── Student Placement ─────────────────────────────────────────────────────────

export const studentPlacementService = {
  async getAll(deptId: string, batch?: string): Promise<StudentPlacement[]> {
    const data = await gqlRequest<{ listStudentPlacements: { items: Record<string, unknown>[] } }>(
      LIST_STUDENT_PLACEMENTS,
      { deptId, ...(batch ? { batch } : {}) },
    )
    return (data.listStudentPlacements?.items ?? []).map(mapStudentPlacement)
  },

  async create(input: Omit<StudentPlacement, 'id'>): Promise<StudentPlacement> {
    const data = await gqlRequest<{ createStudentPlacement: Record<string, unknown> }>(
      CREATE_STUDENT_PLACEMENT,
      { input },
    )
    return mapStudentPlacement(data.createStudentPlacement)
  },

  async update(id: string, patch: Partial<Omit<StudentPlacement, 'id'>>): Promise<StudentPlacement> {
    const data = await gqlRequest<{ updateStudentPlacement: Record<string, unknown> }>(
      UPDATE_STUDENT_PLACEMENT,
      { input: { studentPlacementId: id, ...patch } },
    )
    return mapStudentPlacement(data.updateStudentPlacement)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_STUDENT_PLACEMENT, { studentPlacementId: id })
  },
}

// ── Achievement ───────────────────────────────────────────────────────────────

export const achievementService = {
  async getAll(deptId: string, type?: 'student' | 'staff'): Promise<Achievement[]> {
    const data = await gqlRequest<{ listAchievements: { items: Record<string, unknown>[] } }>(
      LIST_ACHIEVEMENTS,
      { deptId, ...(type ? { type } : {}) },
    )
    return (data.listAchievements?.items ?? []).map(mapAchievement)
  },

  async create(input: Omit<Achievement, 'id'>): Promise<Achievement> {
    const data = await gqlRequest<{ createAchievement: Record<string, unknown> }>(
      CREATE_ACHIEVEMENT,
      { input },
    )
    return mapAchievement(data.createAchievement)
  },

  async update(id: string, patch: Partial<Omit<Achievement, 'id'>>): Promise<Achievement> {
    const data = await gqlRequest<{ updateAchievement: Record<string, unknown> }>(
      UPDATE_ACHIEVEMENT,
      { input: { achievementId: id, ...patch } },
    )
    return mapAchievement(data.updateAchievement)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_ACHIEVEMENT, { achievementId: id })
  },
}

// ── DeptActivity ──────────────────────────────────────────────────────────────

export const deptActivityService = {
  async getAll(deptId: string, type?: 'forum' | 'department'): Promise<DeptActivity[]> {
    const data = await gqlRequest<{ listDeptActivities: { items: Record<string, unknown>[] } }>(
      LIST_DEPT_ACTIVITIES,
      { deptId, ...(type ? { type } : {}) },
    )
    return (data.listDeptActivities?.items ?? []).map(mapDeptActivity)
  },

  async create(input: Omit<DeptActivity, 'id'>): Promise<DeptActivity> {
    const data = await gqlRequest<{ createDeptActivity: Record<string, unknown> }>(
      CREATE_DEPT_ACTIVITY,
      { input },
    )
    return mapDeptActivity(data.createDeptActivity)
  },

  async update(id: string, patch: Partial<Omit<DeptActivity, 'id'>>): Promise<DeptActivity> {
    const data = await gqlRequest<{ updateDeptActivity: Record<string, unknown> }>(
      UPDATE_DEPT_ACTIVITY,
      { input: { deptActivityId: id, ...patch } },
    )
    return mapDeptActivity(data.updateDeptActivity)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_DEPT_ACTIVITY, { deptActivityId: id })
  },
}

// ── Forum Section ─────────────────────────────────────────────────────────────

export const forumSectionService = {
  async getByDept(deptId: string): Promise<ForumSection | null> {
    try {
      const data = await gqlRequest<{ getForumSection: Record<string, unknown> | null }>(
        GET_FORUM_SECTION,
        { deptId },
      )
      return data.getForumSection ? mapForumSection(data.getForumSection) : null
    } catch {
      return null
    }
  },

  async upsert(deptId: string, input: { title: string; description: string }): Promise<ForumSection> {
    const data = await gqlRequest<{ saveForumSection: Record<string, unknown> }>(
      SAVE_FORUM_SECTION,
      { input: { deptId, ...input } },
    )
    return mapForumSection(data.saveForumSection)
  },
}

// ── Forum Event ───────────────────────────────────────────────────────────────

export const forumEventService = {
  async getAll(deptId: string): Promise<ForumEvent[]> {
    const data = await gqlRequest<{ listForumEvents: { items: Record<string, unknown>[] } }>(
      LIST_FORUM_EVENTS,
      { deptId },
    )
    return (data.listForumEvents?.items ?? []).map(mapForumEvent)
  },

  async create(input: Omit<ForumEvent, 'id'>): Promise<ForumEvent> {
    const { deptId, title, description } = input
    const data = await gqlRequest<{ createForumEvent: Record<string, unknown> }>(
      CREATE_FORUM_EVENT,
      { input: { deptId, title, description } },
    )
    return mapForumEvent(data.createForumEvent)
  },

  async update(id: string, patch: Partial<Omit<ForumEvent, 'id'>>): Promise<ForumEvent> {
    const data = await gqlRequest<{ updateForumEvent: Record<string, unknown> }>(
      UPDATE_FORUM_EVENT,
      { input: { forumEventId: id, ...patch } },
    )
    return mapForumEvent(data.updateForumEvent)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_FORUM_EVENT, { forumEventId: id })
  },
}

// ── Department Activity ───────────────────────────────────────────────────────

export const departmentActivityService = {
  async getAll(deptId: string): Promise<DepartmentActivity[]> {
    const data = await gqlRequest<{ listDepartmentActivities: { items: Record<string, unknown>[] } }>(
      LIST_DEPARTMENT_ACTIVITIES,
      { deptId },
    )
    return (data.listDepartmentActivities?.items ?? []).map(mapDepartmentActivity)
  },

  async create(input: Omit<DepartmentActivity, 'id'>): Promise<DepartmentActivity> {
    const { deptId, text } = input
    const data = await gqlRequest<{ createDepartmentActivity: Record<string, unknown> }>(
      CREATE_DEPARTMENT_ACTIVITY,
      { input: { deptId, text } },
    )
    return mapDepartmentActivity(data.createDepartmentActivity)
  },

  async update(id: string, patch: Partial<Omit<DepartmentActivity, 'id'>>): Promise<DepartmentActivity> {
    const data = await gqlRequest<{ updateDepartmentActivity: Record<string, unknown> }>(
      UPDATE_DEPARTMENT_ACTIVITY,
      { input: { deptActivityLogId: id, ...patch } },
    )
    return mapDepartmentActivity(data.updateDepartmentActivity)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_DEPARTMENT_ACTIVITY, { deptActivityLogId: id })
  },
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export const newsletterService = {
  async getAll(deptId: string): Promise<DeptNewsletter[]> {
    const data = await gqlRequest<{ listNewsletters: { items: Record<string, unknown>[] } }>(
      LIST_NEWSLETTERS,
      { deptId },
    )
    return (data.listNewsletters?.items ?? []).map(mapNewsletter)
  },

  async create(input: Omit<DeptNewsletter, 'id'>): Promise<DeptNewsletter> {
    const data = await gqlRequest<{ createNewsletter: Record<string, unknown> }>(
      CREATE_NEWSLETTER,
      { input },
    )
    return mapNewsletter(data.createNewsletter)
  },

  async update(id: string, patch: Partial<Omit<DeptNewsletter, 'id'>>): Promise<DeptNewsletter> {
    const data = await gqlRequest<{ updateNewsletter: Record<string, unknown> }>(
      UPDATE_NEWSLETTER,
      { input: { newsletterId: id, ...patch } },
    )
    return mapNewsletter(data.updateNewsletter)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_NEWSLETTER, { newsletterId: id })
  },
}

// ── Gallery Photo ─────────────────────────────────────────────────────────────

export const deptGalleryService = {
  async getAll(deptId: string, category?: string): Promise<DeptGalleryPhoto[]> {
    const data = await gqlRequest<{ listGalleryPhotos: { items: Record<string, unknown>[] } }>(
      LIST_GALLERY_PHOTOS,
      { deptId, ...(category ? { category } : {}) },
    )
    return (data.listGalleryPhotos?.items ?? []).map(mapGalleryPhoto)
  },

  async create(input: Omit<DeptGalleryPhoto, 'id'>): Promise<DeptGalleryPhoto> {
    const data = await gqlRequest<{ createGalleryPhoto: Record<string, unknown> }>(
      CREATE_GALLERY_PHOTO,
      { input },
    )
    return mapGalleryPhoto(data.createGalleryPhoto)
  },

  async update(id: string, patch: Partial<Omit<DeptGalleryPhoto, 'id'>>): Promise<DeptGalleryPhoto> {
    const data = await gqlRequest<{ updateGalleryPhoto: Record<string, unknown> }>(
      UPDATE_GALLERY_PHOTO,
      { input: { galleryPhotoId: id, ...patch } },
    )
    return mapGalleryPhoto(data.updateGalleryPhoto)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_GALLERY_PHOTO, { galleryPhotoId: id })
  },
}
