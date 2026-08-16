import { AuthPageShell } from '@/features/auth/AuthPageShell';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
