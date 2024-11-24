import AuthForm from '@/features/auth/components/auth-form'
import { AuthFormType } from '@/features/auth/schemas'

export default function Page() {
  return <AuthForm type={AuthFormType.SIGN_IN} />
}
