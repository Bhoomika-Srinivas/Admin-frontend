import { useState } from 'react'
import { z } from 'zod'

/** Recursively unwrap ZodEffects (.refine / .superRefine) to reach the inner ZodObject shape. */
function getShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> | null {
  const maybeShape = (schema as any).shape
  if (maybeShape && typeof maybeShape === 'object') return maybeShape as Record<string, z.ZodTypeAny>
  const inner = (schema as any)._def?.schema
  if (inner) return getShape(inner)
  return null
}

/**
 * Manages form field errors.
 * - `errors`         — current error map
 * - `setErrors`      — set all errors at once (used in handleSave)
 * - `validateField`  — validate a single field on blur
 * - `clearErrors`    — reset all errors (used when opening/closing modals)
 */
export function useFormErrors(schema: z.ZodTypeAny) {
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function validateField(field: string, value: unknown) {
    const shape = getShape(schema)
    if (!shape || !shape[field]) return
    const result = shape[field].safeParse(value)
    setErrors(prev => {
      const next = { ...prev }
      if (result.success) {
        delete next[field]
      } else {
        next[field] = result.error!.issues.map(i => i.message)
      }
      return next
    })
  }

  function clearErrors() {
    setErrors({})
  }

  return { errors, setErrors, validateField, clearErrors }
}
