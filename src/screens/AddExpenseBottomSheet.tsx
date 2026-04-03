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
import React, { useState, useCallback, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { lightColors, spacing, borderRadii } from '../theme/theme';
import { supabase } from '../services/supabase';
import { getTodayFormatted } from '../utils/dateUtils';
import { mapExpenseToDB } from '../utils/mapper';
import { useExpenses } from '../hooks/useExpenses';
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
  const { projectId, expenseId } = route.params;
  const { expenses } = useExpenses(projectId);
  
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // Pre-fill form if editing
  useEffect(() => {
    if (expenseId) {
      const existingExpense = expenses.find((e) => e.expenseId === expenseId);
      if (existingExpense) {
        setForm({
          amount: existingExpense.amount.toString(),
          currency: existingExpense.currency,
          type: existingExpense.type,
          date: existingExpense.date,
          paymentMethod: existingExpense.paymentMethod,
          claimant: existingExpense.claimant,
          paymentStatus: existingExpense.paymentStatus,
          description: existingExpense.description || '',
          location: existingExpense.location || '',
        });
      }
    }
  }, [expenseId, expenses]);

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
      
      if (expenseId) {
        await supabase
          .from('expenses')
          .update(dbPayload)
          .eq('expense_id', expenseId);
      } else {
        await supabase.from('expenses').insert(dbPayload);
      }
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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ Amount & Currency Row (Hero Size) ═══ */}
        <View style={styles.heroAmountContainer}>
          <Text style={styles.heroCurrencySymbol}>$</Text>
          <TextInput
            style={[styles.heroAmountInput, errors.amount ? { color: lightColors.error } : null]}
            value={form.amount}
            onChangeText={(v) => updateField('amount', v)}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={lightColors.textTertiary}
          />
        </View>
        {errors.amount ? <Text style={[styles.errorText, { textAlign: 'center', marginBottom: spacing.lg }]}>{errors.amount}</Text> : null}

        {/* ═══ Expense Type (Scrollable Segmented Button Bar) ═══ */}
        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text style={styles.fieldLabel}>Expense Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollableSelectorGrid}>
            {EXPENSE_TYPES.map((t) => {
              const isSelected = form.type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.scrollablePill, isSelected && styles.scrollablePillSelected]}
                  onPress={() => updateField('type', t)}
                >
                  <Text
                    style={[
                      styles.scrollablePillText,
                      isSelected && styles.scrollablePillTextSelected,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ═══ Row-Based Grid Fields ═══ */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Date *</Text>
              <TouchableOpacity
                style={[styles.input, errors.date ? styles.inputError : null, { justifyContent: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: form.date ? lightColors.onSurface : lightColors.textTertiary, fontSize: 16 }}>
                  {form.date || 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.date ? new Date(form.date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (event.type === 'set' && selectedDate) {
                      updateField('date', selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
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

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Claimant *</Text>
              <TextInput
                style={[styles.input, errors.claimant ? styles.inputError : null]}
                value={form.claimant}
                onChangeText={(v) => updateField('claimant', v)}
                placeholder="Who paid?"
                placeholderTextColor={lightColors.textTertiary}
              />
              {errors.claimant ? <Text style={styles.errorText}>{errors.claimant}</Text> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <TextInput
                style={styles.input}
                value={form.paymentMethod}
                onChangeText={(v) => updateField('paymentMethod', v)}
                placeholder="Cash, Card..."
                placeholderTextColor={lightColors.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* ═══ Payment Status (Scrollable Segmented Buttons) ═══ */}
        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text style={styles.fieldLabel}>Payment Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollableSelectorGrid}>
            {PAYMENT_STATUSES.map((s) => {
              const isSelected = form.paymentStatus === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.scrollablePill,
                    isSelected && styles.scrollablePillSelected,
                  ]}
                  onPress={() => updateField('paymentStatus', s)}
                >
                  <Text
                    style={[
                      styles.scrollablePillText,
                      isSelected && styles.scrollablePillTextSelected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
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
              {isSubmitting ? 'Saving...' : expenseId ? 'Update Expense' : 'Save Expense'}
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

  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xl,
  },

  section: {
    gap: spacing.md,
  },

  heroAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },

  heroCurrencySymbol: {
    fontSize: 32,
    fontWeight: '400',
    color: lightColors.textTertiary,
    marginRight: spacing.sm,
    marginTop: -4,
  },

  heroAmountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: lightColors.primary,
    textAlign: 'center',
    minWidth: 100,
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

  // Scrollable selectors
  scrollableSelectorGrid: {
    paddingRight: spacing.xl,
    gap: spacing.md,
  },

  scrollablePill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadii.full,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollablePillSelected: {
    borderColor: lightColors.primary,
    backgroundColor: 'rgba(47, 62, 70, 0.1)',
  },

  scrollablePillText: {
    fontSize: 14,
    color: lightColors.onSurface,
  },

  scrollablePillTextSelected: {
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
