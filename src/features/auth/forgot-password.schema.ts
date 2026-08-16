import * as z from 'zod';

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      'Invalid email address',
    ),
});

type ForgotPasswordType = z.infer<typeof schema>;

export { schema };
export type { ForgotPasswordType };
