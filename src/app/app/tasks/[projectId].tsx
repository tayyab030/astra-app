import { useLocalSearchParams } from 'expo-router';

import { useProjectDetails } from '@/features/tasks/hooks/useProjects';
import { DetailHeader } from '@/features/tasks/detail/DetailHeader';
import { TaskDetailLayout } from '@/features/tasks/detail/TaskDetailLayout';

export default function ProjectTasksPage() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const id = typeof projectId === 'string' ? projectId : projectId?.[0] ?? '';

  const projectQuery = useProjectDetails(id, Boolean(id));
  const project = projectQuery.data;

  return (
    <TaskDetailLayout
      header={
        <DetailHeader
          title={project?.title ?? 'Project Tasks'}
          subtitle="Project tasks"
          iconColor={project?.color || '#5EC5DC'}
          iconName="folder-outline"
          starred={project?.starred}
        />
      }
      listParams={{ project_id: id }}
      fixedProjectId={id}
    />
  );
}
