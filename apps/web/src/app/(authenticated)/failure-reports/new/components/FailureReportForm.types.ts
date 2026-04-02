import { z } from 'zod'
import type { ActionState } from '../../../admin/utils/actionResult'

export const FailureReportFormSchema = z.object({
  equipmentPublicId: z.string().min(1),
  partPublicId: z.string().optional(),
  occurredAt: z.string().min(1),
  symptom: z.string().min(1),
  estimatedCause: z.string().optional(),
  action: z.string().min(1),
  actionAt: z.string().min(1),
  responderPublicId: z.string().min(1),
  note: z.string().optional(),
})

export type EquipmentOption = {
  publicId: string
  name: string
  lineName: string
}

export type PartOption = {
  publicId: string
  equipmentId: number
  name: string
  equipmentPublicId: string
}

export type UserOption = {
  publicId: string
  firstName: string
  lastName: string
}

export type FailureReportFormProps = {
  equipments: EquipmentOption[]
  parts: PartOption[]
  users: UserOption[]
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
}
