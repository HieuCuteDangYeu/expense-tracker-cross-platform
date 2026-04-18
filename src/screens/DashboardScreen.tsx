/**
 * DashboardScreen — Main entry point displaying a searchable and filterable list of projects.
 * Features a sticky search bar, advanced filtering capabilities, and a dynamic project list.
 */
import React, { useCallback, useState } from 'react';
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
import AdvancedSearchPanel from '../components/AdvancedSearchPanel';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Data ingestion via custom hook with built-in search/filter logic
  const {
    projects,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterState,
    setFilterState,
    managers,
    refetch,
    toggleFavorite,
  } = useProjects();

  /**
   * Navigate to the project details view.
   */
  const handleProjectPress = useCallback(
    (projectId: string) => {
      navigation.navigate('ProjectDetails', { projectId });
    },
    [navigation]
  );

  // Show a full-screen loading state on initial render
  if (isLoading && projects.length === 0) {
    return <FullScreenLoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      {/* Search & Filter Header Section */}
      <View style={styles.searchBarSurface}>
        <View style={styles.searchRow}>
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

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={() => setIsFilterVisible((prev) => !prev)}
          >
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Advanced Filtering Options Panel */}
      <AdvancedSearchPanel
        visible={isFilterVisible}
        filterState={filterState}
        managers={managers}
        onStatusChange={(status) => setFilterState((prev) => ({ ...prev, status }))}
        onManagerChange={(manager) => setFilterState((prev) => ({ ...prev, manager }))}
        onStartDateChange={(startDate) => setFilterState((prev) => ({ ...prev, startDate }))}
        onEndDateChange={(endDate) => setFilterState((prev) => ({ ...prev, endDate }))}
        onFavoritesOnlyChange={(favoritesOnly) => setFilterState((prev) => ({ ...prev, favoritesOnly }))}
        onClearFilters={() => setFilterState({})}
      />

      {/* Main Project Feed */}
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
              searchQuery || Object.keys(filterState).length > 0
                ? 'Try adjusting your search terms or filters'
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
            onToggleFavorite={() => toggleFavorite(item.project.projectId, item.project.isFavorite)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  searchBarSurface: {
    backgroundColor: lightColors.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: lightColors.outline,
    borderRadius: borderRadii.md,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.lg,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.bodyMedium.fontSize,
    color: lightColors.onSurface,
    height: '100%',
    padding: 0,
  },
  filterButton: {
    marginLeft: spacing.md,
    backgroundColor: lightColors.primary,
    borderRadius: borderRadii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: lightColors.onPrimary,
    fontSize: typography.labelMedium.fontSize,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: 100, // Safe area padding for interactions
  },
  separator: {
    height: spacing.lg,
  },
  emptyState: {
    marginTop: spacing.xl,
  },
});
