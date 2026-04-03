/**
 * AddProjectScreen — mirrors AddProjectScreen.kt exactly.
 *
 * 4 form sections matching Kotlin 1:1:
 *   1. General Information: Project ID (readonly), Project Name, Description
 *   2. Dates & Management: Start Date, End Date, Manager
 *   3. Financials & Status: Status dropdown, Budget
 *   4. Additional Details: Client, Priority (3-button), Special Requirements
 *
 * Footer: Cancel (outlined) + Submit (primary) buttons with divider
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, spacing, borderRadii } from '../theme/theme';
import { supabase } from '../services/supabase';
import { getTodayFormatted } from '../utils/dateUtils';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProject'>;

interface FormState {
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  manager: string;
  status: string;
  budget: string;
  clientInfo: string;
  priority: string;
  specialRequirements: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

export default function AddProjectScreen({ navigation, route }: Props) {
  const editProjectId = route.params?.projectId;

  const [form, setForm] = useState<FormState>({
    projectName: '',
    description: '',
    startDate: getTodayFormatted(),
    endDate: '',
    manager: '',
    status: 'Active',
    budget: '',
    clientInfo: '',
    priority: 'Medium',
    specialRequirements: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Update a field
  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // Validate form (matching ProjectFormViewModel.validate)
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!form.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!form.startDate.trim()) newErrors.startDate = 'Start date is required';
    if (!form.endDate.trim()) newErrors.endDate = 'End date is required';
    if (!form.manager.trim()) newErrors.manager = 'Manager is required';
    if (!form.budget.trim() || isNaN(Number(form.budget)))
      newErrors.budget = 'Valid budget is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        projectName: form.projectName.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        manager: form.manager.trim(),
        status: form.status,
        budget: parseFloat(form.budget),
        clientInfo: form.clientInfo.trim() || null,
        priority: form.priority,
        specialRequirements: form.specialRequirements.trim() || null,
        isDeleted: false,
      };

      if (editProjectId) {
        await supabase.from('projects').update(payload).eq('projectId', editProjectId);
      } else {
        await supabase.from('projects').insert(payload);
      }
      navigation.goBack();
    } catch {
      // Error handling can be enhanced
    } finally {
      setIsSubmitting(false);
    }
  }, [form, editProjectId, validate, navigation]);

  const statuses = ['Active', 'Completed', 'On Hold'];

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ Section 1: General Information ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL INFORMATION</Text>

          <View style={styles.fieldsGroup}>
            {editProjectId && (
              <ValidatedField
                label="Project ID"
                value={`PRJ-${String(editProjectId).padStart(4, '0')}`}
                onChangeText={() => {}}
                readOnly
                description="e.g. PRJ-2024-001"
              />
            )}

            <ValidatedField
              label="Project Name"
              value={form.projectName}
              onChangeText={(v) => updateField('projectName', v)}
              error={errors.projectName}
              required
              description="Enter project name"
            />

            <ValidatedField
              label="Description"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              multiline
              inputHeight={100}
              description="Briefly describe the project scope and expenses..."
            />
          </View>
        </View>

        {/* ═══ Section 2: Dates & Management ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATES & MANAGEMENT</Text>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <ValidatedField
                label="Start Date"
                value={form.startDate}
                onChangeText={(v) => updateField('startDate', v)}
                error={errors.startDate}
                required
                description="YYYY-MM-DD"
              />
            </View>
            <View style={styles.dateField}>
              <ValidatedField
                label="End Date"
                value={form.endDate}
                onChangeText={(v) => updateField('endDate', v)}
                error={errors.endDate}
                required
                description="YYYY-MM-DD"
              />
            </View>
          </View>

          <ValidatedField
            label="Manager Name"
            value={form.manager}
            onChangeText={(v) => updateField('manager', v)}
            error={errors.manager}
            required
            description="Assign a project lead"
          />
        </View>

        {/* ═══ Section 3: Financials & Status ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FINANCIALS & STATUS</Text>

          <View style={styles.dateRow}>
            {/* Status Dropdown */}
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Status</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowStatusDropdown(true)}
              >
                <Text style={styles.dropdownText}>{form.status}</Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={24}
                  color={lightColors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            {/* Budget */}
            <View style={styles.dateField}>
              <ValidatedField
                label="Budget"
                value={form.budget}
                onChangeText={(v) => updateField('budget', v)}
                error={errors.budget}
                required
                keyboardType="numeric"
                description="0.00"
              />
            </View>
          </View>
        </View>

        {/* ═══ Section 4: Additional Details ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ADDITIONAL DETAILS (OPTIONAL)</Text>

          <View style={styles.fieldsGroup}>
            <ValidatedField
              label="Client / Department"
              value={form.clientInfo}
              onChangeText={(v) => updateField('clientInfo', v)}
              description="Internal or External client"
            />

            {/* Priority Level (3-button segmented) */}
            <View>
              <Text style={styles.fieldLabel}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {['Low', 'Medium', 'High'].map((p) => {
                  const isSelected = form.priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        isSelected && styles.priorityButtonSelected,
                      ]}
                      onPress={() => updateField('priority', p)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          isSelected && styles.priorityTextSelected,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <ValidatedField
              label="Special Requirements"
              value={form.specialRequirements}
              onChangeText={(v) => updateField('specialRequirements', v)}
              multiline
              inputHeight={100}
            />
          </View>
        </View>
      </ScrollView>

      {/* ═══ Footer: Cancel + Submit ═══ */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Dropdown Modal */}
      <Modal
        visible={showStatusDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusDropdown(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setShowStatusDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            {statuses.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.dropdownItem}
                onPress={() => {
                  updateField('status', s);
                  setShowStatusDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── ValidatedField — mirrors ValidatedTextField composable ─────────────────
interface ValidatedFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  inputHeight?: number;
  description?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

function ValidatedField({
  label,
  value,
  onChangeText,
  error,
  required,
  readOnly,
  multiline,
  inputHeight,
  description,
  keyboardType = 'default',
}: ValidatedFieldProps) {
  return (
    <View>
      {/* Label row: "Label *" */}
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={styles.requiredStar}> *</Text>}
      </View>

      {/* Input (OutlinedTextField mapped to TextInput) */}
      <TextInput
        style={[
          styles.textInput,
          inputHeight ? { height: inputHeight, textAlignVertical: 'top' } : null,
          error ? styles.textInputError : null,
          readOnly ? styles.textInputReadOnly : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        editable={!readOnly}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor={lightColors.textTertiary}
      />

      {/* Error or description text */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : description ? (
        <Text style={styles.descriptionText}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: lightColors.background,
  },

  scrollView: {
    flex: 1,
  },

  // Column(padding=16, spacedBy=24)
  scrollContent: {
    padding: spacing.xl,                  // .padding(16.dp)
    gap: spacing.xxl,                     // spacedBy(24.dp)
    paddingBottom: 120,
  },

  // Section header: uppercase, 14.sp, Medium, primary, bottom=16
  section: {},

  sectionTitle: {
    fontSize: 14,                          // 14.sp
    fontWeight: '500',                     // FontWeight.Medium
    letterSpacing: 0.5,                    // 0.5.sp
    color: lightColors.primary,
    marginBottom: spacing.xl,             // padding(bottom = 16.dp)
  },

  fieldsGroup: {
    gap: spacing.xl,                      // spacedBy(16.dp)
  },

  // Date row (2 fields side by side)
  dateRow: {
    flexDirection: 'row',
    gap: spacing.xl,                      // spacedBy(16.dp)
    marginBottom: spacing.xl,
  },

  dateField: {
    flex: 1,
  },

  // Field label: 14.sp Medium onSurface, padding(h=4)
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,                      // Spacer(6.dp)
    paddingHorizontal: 4,                 // padding(horizontal = 4.dp)
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.onSurface,
    paddingHorizontal: 4,
    marginBottom: 6,
  },

  requiredStar: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.error,
  },

  // OutlinedTextField → TextInput with border
  textInput: {
    height: 56,                            // .height(56.dp)
    borderWidth: 1,
    borderColor: lightColors.outlineVariant, // unfocusedBorderColor
    borderRadius: borderRadii.md,          // RoundedCornerShape(8.dp)
    backgroundColor: lightColors.surface,   // containerColor
    paddingHorizontal: spacing.lg,
    fontSize: 16,                           // 16.sp
    color: lightColors.onSurface,
  },

  textInputError: {
    borderColor: lightColors.error,
  },

  textInputReadOnly: {
    backgroundColor: lightColors.surfaceVariant,
  },

  errorText: {
    fontSize: 12,
    color: lightColors.error,
    marginTop: 6,                          // padding(top = 6.dp)
    marginLeft: 4,                         // start = 4.dp
  },

  descriptionText: {
    fontSize: 12,
    color: lightColors.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },

  // Status dropdown button (mimics OutlinedTextField + ArrowDropDown)
  dropdownButton: {
    height: 56,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    borderRadius: borderRadii.md,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownText: {
    fontSize: 16,
    color: lightColors.onSurface,
  },

  // Priority level buttons (3-button segmented control)
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.md,                      // spacedBy(8.dp)
  },

  priorityButton: {
    flex: 1,
    height: 40,                           // .height(40.dp)
    borderRadius: borderRadii.md,         // RoundedCornerShape(8.dp)
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    backgroundColor: lightColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  priorityButtonSelected: {
    borderColor: lightColors.primary,
    backgroundColor: 'rgba(47, 62, 70, 0.1)', // primary.copy(alpha=0.1f)
  },

  priorityText: {
    fontSize: 14,
    color: lightColors.onSurface,
  },

  priorityTextSelected: {
    fontWeight: '500',
    color: lightColors.primary,
  },

  // Footer (matching bottomBar): divider + Row(End, p=16)
  footer: {
    backgroundColor: lightColors.surface,
  },

  footerDivider: {
    height: 1,
    backgroundColor: lightColors.outlineVariant,
  },

  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: spacing.xl,                  // .padding(16.dp)
  },

  // OutlinedButton — Cancel (border + primary text)
  cancelButton: {
    height: 40,                           // .height(40.dp)
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    borderRadius: borderRadii.md,
    paddingHorizontal: spacing.xxl,       // horizontal = 24.dp
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,              // padding(end = 12.dp)
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.primary,
  },

  // Button — Submit (primary bg)
  submitButton: {
    height: 40,
    borderRadius: borderRadii.md,
    backgroundColor: lightColors.primary,
    paddingHorizontal: 32,                // horizontal = 32.dp
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.onPrimary,
  },

  // Dropdown modal
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },

  dropdownMenu: {
    width: '60%',
    backgroundColor: lightColors.surface,
    borderRadius: borderRadii.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  dropdownItem: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  dropdownItemText: {
    fontSize: 16,
    color: lightColors.onSurface,
  },
});
