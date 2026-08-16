import * as z from 'zod';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
      .regex(/\d/, 'Password must contain at least 1 number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least 1 special character',
      ),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters')
      .regex(/[A-Z]/, 'Confirm password must contain at least 1 uppercase letter')
      .regex(/[a-z]/, 'Confirm password must contain at least 1 lowercase letter')
      .regex(/\d/, 'Confirm password must contain at least 1 number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Confirm password must contain at least 1 special character',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordType = z.infer<typeof schema>;

export { schema };
export type { ResetPasswordType };
