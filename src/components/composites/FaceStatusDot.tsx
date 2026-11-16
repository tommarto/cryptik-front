import { CircleAlert, CircleCheck, CircleOff, Clock, Loader } from 'lucide-react'
import { FACE_STATUS_LABEL, FaceSyncStatus } from '../../types/face'

const STATUS_STYLE: Record<FaceSyncStatus, { Icon: typeof Clock; className: string }> = {
  [FaceSyncStatus.Unsynced]: { Icon: CircleOff, className: 'text-slate-300' },
  [FaceSyncStatus.Queued]: { Icon: Clock, className: 'text-amber-300' },
  [FaceSyncStatus.Syncing]: { Icon: Loader, className: 'animate-spin text-sky-300' },
  [FaceSyncStatus.Synced]: { Icon: CircleCheck, className: 'text-emerald-300' },
  [FaceSyncStatus.Failed]: { Icon: CircleAlert, className: 'text-red-300' },
  [FaceSyncStatus.Unsyncing]: { Icon: Loader, className: 'animate-spin text-slate-300' },
}

export function FaceStatusDot({ status }: { status: FaceSyncStatus }) {
  const { Icon, className } = STATUS_STYLE[status]
  return (
    <span
      title={FACE_STATUS_LABEL[status]}
      className="flex rounded-full bg-slate-950/85 p-0.5 ring-1 ring-slate-700"
    >
      <Icon className={`size-3 ${className}`} />
    </span>
  )
}
