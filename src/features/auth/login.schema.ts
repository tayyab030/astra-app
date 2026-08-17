import * as z from 'zod';

const schema = z.object({
  login: z.string().min(1, 'Login is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginType = z.infer<typeof schema>;

export { schema };
export type { LoginType };
