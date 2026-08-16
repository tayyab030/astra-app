import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { GOAL_CATEGORY_COLORS } from '@/features/tasks/constants';
import { DetailHeader } from '@/features/tasks/detail/DetailHeader';
import { TaskDetailLayout } from '@/features/tasks/detail/TaskDetailLayout';
import { fetchGoal } from '@/lib/api/goals';

export default function GoalTasksPage() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const id = typeof goalId === 'string' ? goalId : goalId?.[0] ?? '';

  const goalQuery = useQuery({
    queryKey: ['goal', id],
    queryFn: () => fetchGoal(id),
    enabled: Boolean(id),
  });

  const goal = goalQuery.data;
  const categoryColor =
    (goal?.category ? GOAL_CATEGORY_COLORS[goal.category] : undefined) ?? '#06b6d4';

  return (
    <TaskDetailLayout
      header={
        <DetailHeader
          title={goal?.title ?? 'Goal Tasks'}
          subtitle="Goal tasks"
          iconColor={categoryColor}
          iconName="flag-outline"
        />
      }
      listParams={{ goal_id: id }}
      fixedGoalId={id}
    />
  );
}
