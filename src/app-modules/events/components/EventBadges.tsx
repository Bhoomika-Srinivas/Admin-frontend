import Badge from '@/shared/components/common/Badge'
import type { Event } from '@/shared/types/models'

export function StatusBadge({ status }: { status: Event['status'] }) {
  if (status === 'upcoming')  return <Badge variant="blue">Upcoming</Badge>
  if (status === 'completed') return <Badge variant="gray">Completed</Badge>
  return <Badge variant="red">Cancelled</Badge>
}

export function ApprovalBadge({ status }: { status: Event['approvalStatus'] }) {
  if (status === 'approved') return <Badge variant="green">Approved</Badge>
  if (status === 'pending')  return <Badge variant="yellow">Pending</Badge>
  return <Badge variant="red">Rejected</Badge>
}

export function DeptBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-medium">
      {name}
    </span>
  )
}

export function LevelTag({ level, department }: { level: Event['level']; department?: string }) {
  if (level === 'institutional') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-purple-50 text-purple-700 border-purple-200">
        Institutional
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-blue-50 text-blue-700 border-blue-200">
      Dept: {department}
    </span>
  )
}
