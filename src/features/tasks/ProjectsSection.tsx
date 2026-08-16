import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';
import type { Project } from '@/lib/api/tasks';

import { PROJECT_FILTER_OPTIONS } from './constants';
import { useProjects } from './hooks/useProjects';
import { ProjectFormModal } from './ProjectFormModal';

export function ProjectsSection() {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.slate200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeleton: {
    width: '47%',
    height: 140,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  card: {
    width: '47%',
    minHeight: 148,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  starBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
    textAlign: 'center',
  },
  cardMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate400,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
}));

  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const {
    projects: allProjects,
    isLoading,
    patchProject,
    deleteProject,
    isPatchingProject,
    isDeletingProject,
  } = useProjects();

  const projects = useMemo(
    () =>
      filter === 'starred'
        ? allProjects.filter((project) => project.starred)
        : allProjects,
    [allProjects, filter],
  );

  const openCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const toggleStar = (project: Project) => {
    void patchProject({
      id: project.id,
      data: { starred: !project.starred },
    });
  };

  const confirmDelete = (project: Project) => {
    Alert.alert(
      'Delete project?',
      `This will permanently delete "${project.title}". This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteProject(project.id);
          },
        },
      ],
    );
  };

  const openProject = (project: Project) => {
    router.push(ROUTES.APP.TASK_PROJECT(project.id) as never);
  };

  return (
    <>
      <DashboardCard>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.heading}>Projects</Text>
            <SelectField
              value={filter}
              options={[...PROJECT_FILTER_OPTIONS]}
              onChange={setFilter}
              minWidth={110}
            />
          </View>
          <PrimaryButton label="Create" icon="add" onPress={openCreate} />
        </View>

        {isLoading ? (
          <View style={styles.grid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.skeleton} />
            ))}
          </View>
        ) : projects.length === 0 ? (
          <WealthEmptyState
            icon={filter === 'starred' ? 'star-outline' : 'folder-open-outline'}
            title={filter === 'starred' ? 'No starred projects' : 'No projects yet'}
            description={
              filter === 'starred'
                ? "You haven't starred any projects yet."
                : 'Create your first project to organize tasks.'
            }
          />
        ) : (
          <View style={styles.grid}>
            {projects.map((project) => {
              const linked = project.linked_tasks ?? {
                total: 0,
                completed: 0,
                pending: 0,
              };

              return (
                <Pressable
                  key={project.id}
                  onPress={() => openProject(project)}
                  disabled={isPatchingProject || isDeletingProject}
                  style={styles.card}
                >
                  {project.starred ? (
                    <View style={styles.starBadge}>
                      <Ionicons name="star" size={14} color="#facc15" />
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: `${project.color || '#5EC5DC'}33` },
                    ]}
                  >
                    <Ionicons
                      name="folder-outline"
                      size={22}
                      color={project.color || '#5EC5DC'}
                    />
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {project.title}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {linked.completed}/{linked.total} tasks
                  </Text>

                  <View style={styles.cardActions}>
                    <Pressable
                      onPress={() => toggleStar(project)}
                      hitSlop={8}
                      disabled={isPatchingProject}
                    >
                      <Ionicons
                        name={project.starred ? 'star' : 'star-outline'}
                        size={16}
                        color={project.starred ? '#facc15' : colors.slate400}
                      />
                    </Pressable>
                    <Pressable onPress={() => openEdit(project)} hitSlop={8}>
                      <Ionicons name="pencil-outline" size={16} color={colors.slate400} />
                    </Pressable>
                    <Pressable onPress={() => confirmDelete(project)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.red400} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </DashboardCard>

      <ProjectFormModal
        visible={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        mode={editingProject ? 'edit' : 'add'}
        project={editingProject}
      />
    </>
  );
}

