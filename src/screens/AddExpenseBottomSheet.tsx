/**
 * AddExpenseBottomSheet — mirrors AddExpenseBottomSheet.kt.
 *
 * Presented as a stack modal (matching presentation: 'modal' in navigator).
 *
 * Form fields (from Kotlin source):
 *   - Amount (number, required)
 *   - Currency (text, default USD)
 *   - Expense Type (segmented button bar: Travel/Equipment/Materials/Services/Software/Labour/Utilities/Misc)
 *   - Date picker
 *   - Payment Method (text)
 *   - Claimant (text, required)
 *   - Payment Status (segmented: Paid/Pending/Reimbursed)
 *   - Description (multiline, optional)
 *   - Location (text, optional)
 *
 * Footer: Cancel + Save buttons
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
} from 'react-native';
import { lightColors, spacing, borderRadii } from '../theme/theme';
import { supabase } from '../services/supabase';
import { getTodayFormatted } from '../utils/dateUtils';
import { mapExpenseToDB } from '../utils/mapper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

const EXPENSE_TYPES = [
  'Travel', 'Equipment', 'Materials', 'Services',
  'Software', 'Labour', 'Utilities', 'Misc',
];

const PAYMENT_STATUSES = ['Paid', 'Pending', 'Reimbursed'];

interface ExpenseForm {
  amount: string;
  currency: string;
  type: string;
  date: string;
  paymentMethod: string;
  claimant: string;
  paymentStatus: string;
  description: string;
  location: string;
}

export default function AddExpenseBottomSheet({ navigation, route }: Props) {
  const { projectId } = route.params;

  const [form, setForm] = useState<ExpenseForm>({
    amount: '',
    currency: 'USD',
    type: 'Travel',
    date: getTodayFormatted(),
    paymentMethod: '',
    claimant: '',
    paymentStatus: 'Pending',
    description: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof ExpenseForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  // Validate (matching ExpenseViewModel validation)
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.amount.trim() || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      newErrors.amount = 'Valid amount is required';
    if (!form.claimant.trim()) newErrors.claimant = 'Claimant is required';
    if (!form.date.trim()) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Save expense
  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        parentProjectId: projectId,
        amount: parseFloat(form.amount),
        currency: form.currency || 'USD',
        type: form.type,
        date: form.date,
        paymentMethod: form.paymentMethod.trim() || 'Cash',
        claimant: form.claimant.trim(),
        paymentStatus: form.paymentStatus,
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        receiptUrl: null,
        isDeleted: false,
      };
      
      const dbPayload = mapExpenseToDB(payload);
      
      await supabase.from('expenses').insert(dbPayload);
      navigation.goBack();
    } catch {
      // Error handling placeholder
    } finally {
      setIsSubmitting(false);
    }
  }, [form, projectId, validate, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Drag handle (matching ModalBottomSheet) */}
      <View style={styles.handleBar}>
        <View style={styles.handle} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ Amount & Currency Row ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPENSE DETAILS</Text>

          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <Text style={styles.fieldLabel}>Amount *</Text>
              <TextInput
                style={[styles.input, errors.amount ? styles.inputError : null]}
                value={form.amount}
                onChangeText={(v) => updateField('amount', v)}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={lightColors.textTertiary}
              />
              {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Currency</Text>
              <TextInput
                style={styles.input}
                value={form.currency}
                onChangeText={(v) => updateField('currency', v)}
                placeholder="USD"
                placeholderTextColor={lightColors.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* ═══ Expense Type (Segmented Button Bar) ═══ */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Expense Type</Text>
          <View style={styles.chipGrid}>
            {EXPENSE_TYPES.map((t) => {
              const isSelected = form.type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => updateField('type', t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ═══ Date & Payment Method ═══ */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Date *</Text>
              <TextInput
                style={[styles.input, errors.date ? styles.inputError : null]}
                value={form.date}
                onChangeText={(v) => updateField('date', v)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={lightColors.textTertiary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <TextInput
                style={styles.input}
                value={form.paymentMethod}
                onChangeText={(v) => updateField('paymentMethod', v)}
                placeholder="e.g. Cash, Card"
                placeholderTextColor={lightColors.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* ═══ Claimant ═══ */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Claimant *</Text>
          <TextInput
            style={[styles.input, errors.claimant ? styles.inputError : null]}
            value={form.claimant}
            onChangeText={(v) => updateField('claimant', v)}
            placeholder="Who incurred this expense?"
            placeholderTextColor={lightColors.textTertiary}
          />
          {errors.claimant ? <Text style={styles.errorText}>{errors.claimant}</Text> : null}
        </View>

        {/* ═══ Payment Status (Segmented Buttons) ═══ */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Payment Status</Text>
          <View style={styles.segmentedRow}>
            {PAYMENT_STATUSES.map((s) => {
              const isSelected = form.paymentStatus === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.segmentButton,
                    isSelected && styles.segmentSelected,
                  ]}
                  onPress={() => updateField('paymentStatus', s)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      isSelected && styles.segmentTextSelected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ═══ Description (Optional) ═══ */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            multiline
            placeholder="Optional notes..."
            placeholderTextColor={lightColors.textTertiary}
          />
        </View>

        {/* ═══ Location (Optional) ═══ */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            style={styles.input}
            value={form.location}
            onChangeText={(v) => updateField('location', v)}
            placeholder="Where was this expense incurred?"
            placeholderTextColor={lightColors.textTertiary}
          />
        </View>
      </ScrollView>

      {/* ═══ Footer Buttons ═══ */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Text style={styles.saveText}>
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.surface,
  },

  // ModalBottomSheet drag handle
  handleBar: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: lightColors.outlineVariant,
    borderRadius: borderRadii.full,
  },

  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: 120,
  },

  section: {
    gap: spacing.md,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: lightColors.primary,
    marginBottom: spacing.md,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.onSurface,
    marginBottom: 6,
    paddingHorizontal: 4,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.xl,
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    borderRadius: borderRadii.md,
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: lightColors.onSurface,
  },

  inputError: {
    borderColor: lightColors.error,
  },

  errorText: {
    fontSize: 12,
    color: lightColors.error,
    marginTop: 6,
    marginLeft: 4,
  },

  // Expense type chips (wrapping grid)
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  chip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadii.full,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    backgroundColor: lightColors.surface,
  },

  chipSelected: {
    borderColor: lightColors.primary,
    backgroundColor: 'rgba(47, 62, 70, 0.1)',
  },

  chipText: {
    fontSize: 13,
    color: lightColors.onSurface,
  },

  chipTextSelected: {
    fontWeight: '600',
    color: lightColors.primary,
  },

  // Payment status segmented buttons
  segmentedRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  segmentButton: {
    flex: 1,
    height: 40,
    borderRadius: borderRadii.md,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    backgroundColor: lightColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  segmentSelected: {
    borderColor: lightColors.primary,
    backgroundColor: 'rgba(47, 62, 70, 0.1)',
  },

  segmentText: {
    fontSize: 14,
    color: lightColors.onSurface,
  },

  segmentTextSelected: {
    fontWeight: '600',
    color: lightColors.primary,
  },

  // Footer
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
    padding: spacing.xl,
    gap: spacing.lg,
  },

  cancelButton: {
    height: 40,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    borderRadius: borderRadii.md,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.primary,
  },

  saveButton: {
    height: 40,
    borderRadius: borderRadii.md,
    backgroundColor: lightColors.primary,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveDisabled: {
    opacity: 0.6,
  },

  saveText: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.onPrimary,
  },
});
