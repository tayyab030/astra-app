import { AuthPageShell } from '@/features/auth/AuthPageShell';
import { SignupForm } from '@/features/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthPageShell>
      <SignupForm />
    </AuthPageShell>
  );
}
