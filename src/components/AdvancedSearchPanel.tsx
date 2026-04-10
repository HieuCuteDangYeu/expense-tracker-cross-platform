import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, typography, spacing, borderRadii } from '../theme/theme';

export interface FilterState {
  status?: string | null;
  manager?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  favoritesOnly?: boolean;
}

interface AdvancedSearchPanelProps {
  visible: boolean;
  filterState: FilterState;
  managers: string[];
  onStatusChange: (status: string | null) => void;
  onManagerChange: (manager: string | null) => void;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
  onFavoritesOnlyChange: (value: boolean) => void;
  onClearFilters: () => void;
}

const statusOptions = ['Active', 'Completed', 'On Hold'];

export default function AdvancedSearchPanel({
  visible,
  filterState,
  managers,
  onStatusChange,
  onManagerChange,
  onStartDateChange,
  onEndDateChange,
  onFavoritesOnlyChange,
  onClearFilters,
}: AdvancedSearchPanelProps) {
  const [managerModalVisible, setManagerModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ADVANCED SEARCH</Text>
        <TouchableOpacity onPress={onClearFilters}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Date Range (2-column layout) */}
      <View style={styles.dateRangeRow}>
        <View style={styles.dateFieldContainer}>
          <Text style={styles.sectionLabel}>START DATE</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDatePicker('start')}
          >
            <Text
              style={[
                styles.dropdownText,
                !filterState.startDate && styles.placeholderText,
              ]}
            >
              {filterState.startDate || 'Select'}
            </Text>
            {filterState.startDate ? (
              <TouchableOpacity onPress={() => onStartDateChange(null)}>
                <MaterialIcons name="close" size={16} color={lightColors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <MaterialIcons name="calendar-today" size={16} color={lightColors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dateFieldContainer}>
          <Text style={styles.sectionLabel}>END DATE</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDatePicker('end')}
          >
            <Text
              style={[
                styles.dropdownText,
                !filterState.endDate && styles.placeholderText,
              ]}
            >
              {filterState.endDate || 'Select'}
            </Text>
            {filterState.endDate ? (
              <TouchableOpacity onPress={() => onEndDateChange(null)}>
                <MaterialIcons name="close" size={16} color={lightColors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <MaterialIcons name="calendar-today" size={16} color={lightColors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === 'start'
              ? (filterState.startDate ? new Date(filterState.startDate) : new Date())
              : (filterState.endDate ? new Date(filterState.endDate) : new Date())
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
             const mode = showDatePicker;
             setShowDatePicker(Platform.OS === 'ios' ? mode : null);
             if (event.type === 'set' && selectedDate) {
               const dateStr = selectedDate.toISOString().split('T')[0];
               if (mode === 'start') onStartDateChange(dateStr);
               if (mode === 'end') onEndDateChange(dateStr);
             }
             if (Platform.OS === 'ios' && event.type === 'set') {
                  setShowDatePicker(null);
             }
          }}
        />
      )}

      {/* Favorites Only Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>FAVORITES</Text>
        <View style={styles.chipsContainer}>
          <TouchableOpacity
            onPress={() => onFavoritesOnlyChange(!filterState.favoritesOnly)}
            style={[
              styles.chip,
              filterState.favoritesOnly && styles.chipSelected,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons
                name={filterState.favoritesOnly ? 'favorite' : 'favorite-border'}
                size={14}
                color={filterState.favoritesOnly ? lightColors.onPrimary : lightColors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.chipText,
                  filterState.favoritesOnly && styles.chipTextSelected,
                ]}
              >
                Favorites Only
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STATUS</Text>
        <View style={styles.chipsContainer}>
          {statusOptions.map((status) => {
            const isSelected = filterState.status === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => onStatusChange(isSelected ? null : status)}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Owner/Manager */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>OWNER</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setManagerModalVisible(true)}
        >
          <Text style={styles.dropdownText}>
            {filterState.manager || 'All Owners'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color={lightColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Manager Selection Modal */}
      <Modal
        visible={managerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setManagerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setManagerModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={['All Owners', ...managers]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onManagerChange(item === 'All Owners' ? null : item);
                    setManagerModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadii.lg,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: lightColors.textSecondary,
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '500',
    color: lightColors.primary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: lightColors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  dateRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateFieldContainer: {
    flex: 1,
    marginRight: spacing.sm, // Assuming the caller adds the other, handling margin properly below. Actually let's just use gap if supported, or space out manually.
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadii.full,
    backgroundColor: lightColors.surfaceVariant,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
  },
  chipSelected: {
    backgroundColor: lightColors.primary,
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: lightColors.onSurfaceVariant,
  },
  chipTextSelected: {
    color: lightColors.onPrimary,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(230, 230, 230, 0.5)', // Simulated unfocusedContainerColor
    borderRadius: borderRadii.md,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  dropdownText: {
    fontSize: 12,
    color: lightColors.onSurface,
  },
  placeholderText: {
    color: lightColors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: lightColors.surface,
    borderRadius: borderRadii.md,
    width: '80%',
    maxHeight: '60%',
    paddingVertical: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  modalItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalItemText: {
    fontSize: 14,
    color: lightColors.onSurface,
  },
});
