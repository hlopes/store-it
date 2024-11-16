import { z } from 'zod'

export enum AuthFormType {
  SIGN_IN,
  SIGN_UP,
}

export const authFormSchema = (type: AuthFormType) =>
  z.object({
    email: z.string().email().min(0),
    fullName:
      type === AuthFormType.SIGN_UP
        ? z.string().min(2).max(50)
        : z.string().optional(),
  })
