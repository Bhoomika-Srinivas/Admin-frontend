import { gqlRequest } from '@/api/graphqlClient'
import type { DeptStaff, Accreditation, CommitteeMember } from '@/shared/types/models'
import { LIST_DEPT_STAFF, LIST_ACCREDITATIONS, LIST_COMMITTEE_MEMBERS } from '../graphql/deptPeople.query'
import {
  CREATE_DEPT_STAFF, UPDATE_DEPT_STAFF, DELETE_DEPT_STAFF,
  CREATE_ACCREDITATION, UPDATE_ACCREDITATION, DELETE_ACCREDITATION,
  CREATE_COMMITTEE_MEMBER, UPDATE_COMMITTEE_MEMBER, DELETE_COMMITTEE_MEMBER,
} from '../graphql/deptPeople.mutation'

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapStaff(r: Record<string, unknown>): DeptStaff {
  return {
    id:          r.deptStaffId as string,
    deptId:      r.deptId as string,
    name:        r.name as string,
    designation: r.designation as string,
    staffType:   (r.staffType as DeptStaff['staffType']) ?? 'supporting',
    imageUrl:    r.imageUrl as string | undefined,
    order:       r.order as number | undefined,
  }
}

function mapAccreditation(r: Record<string, unknown>): Accreditation {
  return {
    id:             r.accreditationId as string,
    deptId:         r.deptId as string,
    name:           r.name as string,
    accreditedBy:   r.accreditedBy as string,
    validFrom:      r.validFrom as string,
    validUntil:     r.validUntil as string,
    grade:          r.grade as string | undefined,
    certificateUrl: r.certificateUrl as string | undefined,
    status:         (r.status as Accreditation['status']) ?? 'active',
  }
}

function mapCommitteeMember(r: Record<string, unknown>): CommitteeMember {
  return {
    id:          r.committeeMemberId as string,
    deptId:      r.deptId as string,
    committee:   r.committee as 'DAB' | 'PAC',
    name:        r.name as string,
    designation: (r.designation as string) ?? '',
    order:       (r.order as number) ?? 0,
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export const deptPeopleService = {
  // ── Staff ───────────────────────────────────────────────────────────────────
  async getStaff(deptId: string): Promise<DeptStaff[]> {
    const data = await gqlRequest<{ listDeptStaff: { items: Record<string, unknown>[] } }>(
      LIST_DEPT_STAFF, { deptId, limit: 100 }
    )
    return (data.listDeptStaff.items ?? []).map(mapStaff)
  },

  async createStaff(input: Omit<DeptStaff, 'id'> & { insertMode?: boolean }): Promise<DeptStaff> {
    const data = await gqlRequest<{ createDeptStaff: Record<string, unknown> }>(
      CREATE_DEPT_STAFF, {
        input: {
          deptId:      input.deptId,
          name:        input.name,
          designation: input.designation,
          staffType:   input.staffType,
          imageUrl:    input.imageUrl || undefined,
          order:       input.order,
          insertMode:  input.insertMode === true ? true : undefined,
        },
      }
    )
    return mapStaff(data.createDeptStaff)
  },

  async updateStaff(id: string, input: Partial<DeptStaff> & { insertMode?: boolean }): Promise<DeptStaff> {
    const data = await gqlRequest<{ updateDeptStaff: Record<string, unknown> }>(
      UPDATE_DEPT_STAFF, {
        input: {
          deptStaffId: id,
          name:        input.name,
          designation: input.designation,
          staffType:   input.staffType,
          imageUrl:    input.imageUrl || undefined,
          order:       input.order,
          insertMode:  (input as Record<string, unknown>).insertMode === true ? true : undefined,
        },
      }
    )
    return mapStaff(data.updateDeptStaff)
  },

  async deleteStaff(id: string): Promise<void> {
    await gqlRequest(DELETE_DEPT_STAFF, { deptStaffId: id })
  },

  // ── Accreditations ──────────────────────────────────────────────────────────
  async getAccreditations(deptId: string): Promise<Accreditation[]> {
    const data = await gqlRequest<{ listAccreditations: { items: Record<string, unknown>[] } }>(
      LIST_ACCREDITATIONS, { deptId, limit: 100 }
    )
    return (data.listAccreditations.items ?? []).map(mapAccreditation)
  },

  async createAccreditation(input: Omit<Accreditation, 'id'>): Promise<Accreditation> {
    const data = await gqlRequest<{ createAccreditation: Record<string, unknown> }>(
      CREATE_ACCREDITATION, {
        input: {
          deptId:         input.deptId,
          name:           input.name,
          accreditedBy:   input.accreditedBy,
          validFrom:      input.validFrom,
          validUntil:     input.validUntil,
          grade:          input.grade,
          certificateUrl: input.certificateUrl,
          status:         input.status,
        },
      }
    )
    return mapAccreditation(data.createAccreditation)
  },

  async updateAccreditation(id: string, input: Partial<Accreditation>): Promise<Accreditation> {
    const data = await gqlRequest<{ updateAccreditation: Record<string, unknown> }>(
      UPDATE_ACCREDITATION, {
        input: {
          accreditationId: id,
          name:            input.name,
          accreditedBy:    input.accreditedBy,
          validFrom:       input.validFrom,
          validUntil:      input.validUntil,
          grade:           input.grade,
          certificateUrl:  input.certificateUrl,
          status:          input.status,
        },
      }
    )
    return mapAccreditation(data.updateAccreditation)
  },

  async deleteAccreditation(id: string): Promise<void> {
    await gqlRequest(DELETE_ACCREDITATION, { accreditationId: id })
  },

  // ── Committee Members ───────────────────────────────────────────────────────
  async getCommitteeMembers(deptId: string, committee: 'DAB' | 'PAC'): Promise<CommitteeMember[]> {
    const data = await gqlRequest<{ listCommitteeMembers: { items: Record<string, unknown>[] } }>(
      LIST_COMMITTEE_MEMBERS, { deptId, committee }
    )
    return (data.listCommitteeMembers.items ?? [])
      .map(mapCommitteeMember)
      .sort((a, b) => a.order - b.order)
  },

  async createCommitteeMember(input: Omit<CommitteeMember, 'id'>): Promise<CommitteeMember> {
    const data = await gqlRequest<{ createCommitteeMember: Record<string, unknown> }>(
      CREATE_COMMITTEE_MEMBER, {
        input: {
          deptId:      input.deptId,
          committee:   input.committee,
          name:        input.name,
          designation: input.designation,
          order:       input.order,
        },
      }
    )
    return mapCommitteeMember(data.createCommitteeMember)
  },

  async updateCommitteeMember(id: string, input: Partial<CommitteeMember>): Promise<CommitteeMember> {
    const data = await gqlRequest<{ updateCommitteeMember: Record<string, unknown> }>(
      UPDATE_COMMITTEE_MEMBER, {
        input: {
          committeeMemberId: id,
          name:              input.name,
          designation:       input.designation,
          order:             input.order,
        },
      }
    )
    return mapCommitteeMember(data.updateCommitteeMember)
  },

  async deleteCommitteeMember(id: string): Promise<void> {
    await gqlRequest(DELETE_COMMITTEE_MEMBER, { committeeMemberId: id })
  },
}
