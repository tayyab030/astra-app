import { AuthPageShell } from '@/features/auth/AuthPageShell';
import { LoginForm } from '@/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthPageShell>
      <LoginForm />
    </AuthPageShell>
  );
}
