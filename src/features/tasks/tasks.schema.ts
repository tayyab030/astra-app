import * as z from 'zod';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const taskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().optional(),
    due_date: z
      .union([z.string().regex(datePattern), z.literal(''), z.null()])
      .optional()
      .transform((value) => (value ? value : null)),
    priority: z.enum(['high', 'medium', 'low']),
    status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
    link_type: z.enum(['none', 'project', 'goal']),
    project_id: z.string().optional(),
    goal_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.link_type === 'project' && !data.project_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a project',
        path: ['project_id'],
      });
    }

    if (data.link_type === 'goal' && !data.goal_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a goal',
        path: ['goal_id'],
      });
    }

    if (data.link_type === 'none' && (data.project_id || data.goal_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Independent tasks cannot be linked',
        path: ['link_type'],
      });
    }
  });

const taskDefaultValues = {
  title: '',
  description: '',
  due_date: null as string | null,
  priority: 'medium' as const,
  status: 'todo' as const,
  link_type: 'none' as const,
  project_id: '',
  goal_id: '',
};

type TaskFormValues = z.input<typeof taskSchema>;

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  starred: z.boolean(),
  status: z.string(),
  color: z.string().min(1, 'Color is required'),
  description: z.string(),
  due_date: z
    .union([z.string().regex(datePattern), z.literal(''), z.null()])
    .optional()
    .transform((value) => (value ? value : null)),
  icon: z.string(),
});

const projectDefaultValues = {
  title: '',
  starred: false,
  status: 'on_track',
  color: '#5EC5DC',
  description: '',
  due_date: null as string | null,
  icon: 'Globe',
};

type ProjectFormValues = z.input<typeof projectSchema>;

export {
  taskSchema,
  taskDefaultValues,
  projectSchema,
  projectDefaultValues,
};
export type { TaskFormValues, ProjectFormValues };
