import { AuthPageShell } from '@/features/auth/AuthPageShell';
import { VerifyOtpForm } from '@/features/auth/VerifyOtpForm';

export default function VerifyOtpPage() {
  return (
    <AuthPageShell>
      <VerifyOtpForm />
    </AuthPageShell>
  );
}
