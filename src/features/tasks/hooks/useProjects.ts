import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createProject,
  deleteProject,
  fetchProject,
  fetchProjects,
  getTasksErrorMessage,
  patchProject,
  updateProject,
  type CreateProjectPayload,
  type PatchProjectPayload,
  type UpdateProjectPayload,
} from '@/lib/api/tasks';
import { showToast } from '@/lib/ui/toastStore';

export function useProjects() {
  const queryClient = useQueryClient();

  const invalidateProjects = () => {
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const createProjectMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: (data) => {
      showToast('success', data.message || 'Project created successfully');
      invalidateProjects();
    },
    onError: (error) => {
      showToast('error', getTasksErrorMessage(error, 'Failed to create project'));
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      updateProject(id, payload),
    onSuccess: (data) => {
      showToast('success', data.message || 'Project updated successfully');
      invalidateProjects();
      void queryClient.invalidateQueries({ queryKey: ['projectDetails'] });
    },
    onError: (error) => {
      showToast('error', getTasksErrorMessage(error, 'Failed to update project'));
    },
  });

  const patchProjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PatchProjectPayload }) =>
      patchProject(id, payload),
    onSuccess: () => {
      invalidateProjects();
    },
    onError: (error) => {
      showToast('error', getTasksErrorMessage(error, 'Failed to update project'));
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (data) => {
      showToast('success', data.message || 'Project deleted successfully');
      invalidateProjects();
    },
    onError: (error) => {
      showToast('error', getTasksErrorMessage(error, 'Failed to delete project'));
    },
  });

  return {
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    refetch: projectsQuery.refetch,
    fetchProjectDetails: (id: string) => fetchProject(id),
    createProject: createProjectMutation.mutateAsync,
    updateProject: ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
      updateProjectMutation.mutateAsync({ id, payload: data }),
    patchProject: ({ id, data }: { id: string; data: PatchProjectPayload }) =>
      patchProjectMutation.mutateAsync({ id, payload: data }),
    deleteProject: deleteProjectMutation.mutateAsync,
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isPatchingProject: patchProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
  };
}

export function useProjectDetails(projectId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['projectDetails', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: Boolean(projectId && enabled),
  });
}
