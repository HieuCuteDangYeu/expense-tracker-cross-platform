/**
 * DashboardScreen — mirrors DashboardScreen.kt exactly.
 *
 * Layout from Kotlin:
 *   Column(fillMaxSize, background)
 *     Surface(sticky search bar, shadow=1.dp)
 *       Row(padding start/end=16, bottom=12, centerVertically)
 *         OutlinedTextField(weight=1, search, rounded=8.dp)
 *         Spacer(8.dp)
 *         Button("Filter", primary, rounded=8.dp)
 *     LazyColumn(contentPadding=16, spacedBy=12)
 *       if empty → EmptyStateMessage
 *       else → items(projects) { ProjectCard }
 *
 * Data: useProjects() hook replaces ProjectViewModel collect.
 * Navigation: onProjectClick → navigate('ProjectDetails')
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, typography, spacing, borderRadii } from '../theme/theme';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import EmptyStateMessage from '../components/EmptyStateMessage';
import FullScreenLoadingIndicator from '../components/FullScreenLoadingIndicator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const {
    projects,
    isLoading,
    searchQuery,
    setSearchQuery,
    refetch,
  } = useProjects();

  // Navigate to ProjectDetails (matching onProjectClick callback)
  const handleProjectPress = useCallback(
    (projectId: number) => {
      navigation.navigate('ProjectDetails', { projectId });
    },
    [navigation]
  );

  // Navigate to AddProject for editing
  const handleEditProject = useCallback(
    (projectId: number) => {
      navigation.navigate('AddProject', { projectId });
    },
    [navigation]
  );

  // Initial loading state
  if (isLoading && projects.length === 0) {
    return <FullScreenLoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      {/* ─── Sticky Search & Filter Bar ─── */}
      {/* Surface(shadowElevation=1.dp) → View with elevation */}
      <View style={styles.searchBarSurface}>
        <View style={styles.searchRow}>
          {/* OutlinedTextField(weight=1f, rounded=8.dp) */}
          <View style={styles.searchInputContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={lightColors.onSurfaceVariant}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search projects"
              placeholderTextColor={lightColors.textSecondary}
            />
          </View>

          {/* Button("Filter", primary, rounded=8.dp) */}
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
          >
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Project List ─── */}
      {/* LazyColumn(contentPadding=16.dp, spacedBy=12.dp) */}
      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.project.projectId)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={lightColors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyStateMessage
            title="No projects found"
            description={
              searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first project to get started'
            }
            iconName="folder-open"
            style={styles.emptyState}
          />
        }
        renderItem={({ item }) => (
          <ProjectCard
            project={item.project}
            expenses={item.expenses}
            onPress={() => handleProjectPress(item.project.projectId)}
            onEdit={() => handleEditProject(item.project.projectId)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,     // background = #F8F9FA
  },

  // Surface(color=surface, shadow=1.dp)
  searchBarSurface: {
    backgroundColor: lightColors.surface,
    elevation: 1,                                 // shadowElevation = 1.dp
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // Row(padding start=16, end=16, bottom=12, centerVertically)
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,                // start/end = 16.dp
    paddingBottom: spacing.lg,                    // bottom = 12.dp
  },

  // OutlinedTextField(weight=1f, rounded=8.dp, singleLine)
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: lightColors.outline,             // unfocusedBorderColor = outline
    borderRadius: borderRadii.md,                 // RoundedCornerShape(8.dp)
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.lg,
  },

  searchIcon: {
    marginRight: spacing.md,
  },

  searchInput: {
    flex: 1,
    fontSize: typography.bodyMedium.fontSize,     // bodyMedium
    color: lightColors.onSurface,
    height: '100%',
    padding: 0,
  },

  // Button(primary, rounded=8.dp, ContentPadding h=16, v=8)
  filterButton: {
    marginLeft: spacing.md,                       // Spacer(8.dp)
    backgroundColor: lightColors.primary,
    borderRadius: borderRadii.md,                 // RoundedCornerShape(8.dp)
    paddingHorizontal: spacing.xl,                // horizontal = 16.dp
    paddingVertical: spacing.md,                  // vertical = 8.dp
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterButtonText: {
    color: lightColors.onPrimary,
    fontSize: typography.labelMedium.fontSize,    // labelMedium
    fontWeight: '700',                            // FontWeight.Bold
  },

  // LazyColumn(contentPadding=16.dp, spacedBy=12.dp)
  listContent: {
    padding: spacing.xl,                          // contentPadding = 16.dp
    paddingBottom: 100,                           // Extra padding for FAB clearance
  },

  separator: {
    height: spacing.lg,                           // spacedBy = 12.dp
  },

  emptyState: {
    marginTop: spacing.xl,
  },
});
