import * as z from 'zod';

import { COUNTRY_CODES } from '@/lib/countries';
import { USER_GENDERS } from '@/lib/gender';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const schema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be no more than 20 characters')
      .regex(
        /^[a-zA-Z0-9._+-]+$/,
        'Username can only contain letters, numbers, and . + - _ characters',
      )
      .refine((value) => !value.includes('@') && !EMAIL_REGEX.test(value), {
        message: 'Username cannot be an email address',
      }),
    email: z
      .string()
      .min(1, 'Email is required')
      .regex(EMAIL_REGEX, 'Invalid email address'),
    gender: z
      .string()
      .min(1, 'Gender is required')
      .refine(
        (value) => (USER_GENDERS as readonly string[]).includes(value),
        'Please select a valid gender',
      ),
    country: z
      .string()
      .min(1, 'Country is required')
      .refine(
        (value) => (COUNTRY_CODES as readonly string[]).includes(value),
        'Please select a valid country',
      ),
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
    terms: z.boolean().refine((val) => val, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) =>
      data.username.trim().toLowerCase() !== data.email.trim().toLowerCase(),
    {
      message: 'Username and email cannot be the same',
      path: ['username'],
    },
  );

type SignUpType = z.infer<typeof schema>;

export { schema };
export type { SignUpType };
