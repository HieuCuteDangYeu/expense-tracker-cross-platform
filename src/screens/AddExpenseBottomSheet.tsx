/**
 * AddExpenseBottomSheet — mirrors AddExpenseBottomSheet.kt.
 *
 * Presented as a stack modal (matching presentation: 'modal' in navigator).
 *
 * Form fields (from Kotlin source):
 *   - Amount (number, required)
 *   - Currency (dropdown: USD/EUR/GBP)
 *   - Expense Type (dropdown picker)
 *   - Date picker
 *   - Payment Method (segmented button bar: Cash/Card/Transfer/Cheque)
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
  Modal,
  Pressable,
  FlatList,
  Alert,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, spacing, borderRadii } from '../theme/theme';
import { getTodayFormatted } from '../utils/dateUtils';
import { useExpenses } from '../hooks/useExpenses';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

const EXPENSE_TYPES = [
  'Travel', 'Equipment', 'Materials', 'Services',
  'Software', 'Labour', 'Utilities', 'Misc',
];

const PAYMENT_METHODS = ['Cash', 'Card', 'Transfer', 'Cheque'];

const CURRENCIES = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
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
  const { expenses, addExpense, updateExpense, uploadReceipt, error: hookError, isSaving } = useExpenses(projectId);

  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // receiptImageUri stores the LOCAL URI for preview; receiptUrl stores the uploaded URL
  const [receiptImageUri, setReceiptImageUri] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const [form, setForm] = useState<ExpenseForm>({
    amount: '',
    currency: 'USD',
    type: 'Travel',
    date: getTodayFormatted(),
    paymentMethod: 'Cash',
    claimant: '',
    paymentStatus: 'Pending',
    description: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        if (existingExpense.receiptUrl) {
          setReceiptImageUri(existingExpense.receiptUrl);
          setReceiptUrl(existingExpense.receiptUrl);
        }
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

  // Currency symbol for hero display
  const currencySymbol = form.currency === 'EUR' ? '€' : form.currency === 'GBP' ? '£' : '$';

  // ─── Image Picker Handlers ───
  const pickImageFromLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to attach a receipt.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptImageUri(result.assets[0].uri);
      setReceiptUrl(null); // Will be uploaded on save
    }
  }, []);

  const pickImageFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take a receipt photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptImageUri(result.assets[0].uri);
      setReceiptUrl(null); // Will be uploaded on save
    }
  }, []);

  const showImagePickerOptions = useCallback(() => {
    const options = ['Take Photo', 'Choose from Library', 'Cancel'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1 },
        (buttonIndex) => {
          if (buttonIndex === 0) pickImageFromCamera();
          else if (buttonIndex === 1) pickImageFromLibrary();
        }
      );
    } else {
      // Android: use a simple Alert-based picker
      Alert.alert(
        'Attach Receipt',
        'Choose a source',
        [
          { text: 'Take Photo', onPress: pickImageFromCamera },
          { text: 'Choose from Library', onPress: pickImageFromLibrary },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  }, [pickImageFromCamera, pickImageFromLibrary]);

  const removeReceipt = useCallback(() => {
    setReceiptImageUri(null);
    setReceiptUrl(null);
  }, []);

  // Save expense — delegates to hook mutations
  const handleSave = useCallback(async () => {
    if (!validate()) return;
    try {
      let finalReceiptUrl = receiptUrl;

      // If there's a new local image (not yet uploaded), upload it first
      if (receiptImageUri && !receiptImageUri.startsWith('http')) {
        setIsUploadingReceipt(true);
        const uploadedUrl = await uploadReceipt(receiptImageUri);
        if (!uploadedUrl) {
          Alert.alert('Upload Failed', hookError || 'Failed to upload receipt image.');
          setIsUploadingReceipt(false);
          return;
        }
        finalReceiptUrl = uploadedUrl;
        setIsUploadingReceipt(false);
      }

      const payload = {
        parentProjectId: projectId,
        amount: parseFloat(form.amount),
        currency: form.currency || 'USD',
        type: form.type,
        date: form.date,
        paymentMethod: form.paymentMethod || 'Cash',
        claimant: form.claimant.trim(),
        paymentStatus: form.paymentStatus,
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        receiptUrl: finalReceiptUrl || null,
      };

      let result;
      if (expenseId) {
        // Edit mode — update via hook
        result = await updateExpense(expenseId, payload);
      } else {
        // Create mode — insert via hook
        result = await addExpense(payload);
      }

      if (result) {
        navigation.goBack();
      } else {
        // Save failed — hook set the error, show alert
        Alert.alert(
          'Save Failed',
          hookError || 'An unexpected error occurred while saving the expense.',
          [{ text: 'OK' }]
        );
      }
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'An unexpected error occurred.', [{ text: 'OK' }]);
    }
  }, [form, projectId, expenseId, validate, navigation, addExpense, updateExpense, hookError, receiptImageUri, receiptUrl, uploadReceipt]);

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
          <Text style={styles.heroCurrencySymbol}>{currencySymbol}</Text>
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

        {/* ═══ Expense Type (Dropdown Picker) ═══ */}
        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text style={styles.fieldLabel}>Expense Type</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowTypePicker(true)}
          >
            <Text style={styles.dropdownButtonText}>{form.type}</Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={lightColors.onSurfaceVariant} />
          </TouchableOpacity>
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
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCurrencyPicker(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {CURRENCIES.find((c) => c.value === form.currency)?.label || form.currency}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={lightColors.onSurfaceVariant} />
              </TouchableOpacity>
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
          </View>
        </View>

        {/* ═══ Payment Method (Segmented Button Bar) ═══ */}
        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <View style={styles.segmentedBar}>
            {PAYMENT_METHODS.map((method, index) => {
              const isSelected = form.paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.segmentedButton,
                    isSelected && styles.segmentedButtonSelected,
                    index === 0 && styles.segmentedButtonFirst,
                    index === PAYMENT_METHODS.length - 1 && styles.segmentedButtonLast,
                  ]}
                  onPress={() => updateField('paymentMethod', method)}
                >
                  <Text
                    style={[
                      styles.segmentedButtonText,
                      isSelected && styles.segmentedButtonTextSelected,
                    ]}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ═══ Payment Status (Segmented Buttons) ═══ */}
        <View style={[styles.section, { gap: spacing.sm }]}>
          <Text style={styles.fieldLabel}>Payment Status</Text>
          <View style={styles.segmentedBar}>
            {PAYMENT_STATUSES.map((s, index) => {
              const isSelected = form.paymentStatus === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.segmentedButton,
                    isSelected && styles.segmentedButtonSelected,
                    index === 0 && styles.segmentedButtonFirst,
                    index === PAYMENT_STATUSES.length - 1 && styles.segmentedButtonLast,
                  ]}
                  onPress={() => updateField('paymentStatus', s)}
                >
                  <Text
                    style={[
                      styles.segmentedButtonText,
                      isSelected && styles.segmentedButtonTextSelected,
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

        {/* ═══ Receipt Attachment ═══ */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Receipt</Text>
          {receiptImageUri ? (
            <View>
              <Image
                source={{ uri: receiptImageUri }}
                style={styles.receiptPreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeReceiptButton}
                onPress={removeReceipt}
              >
                <MaterialIcons name="delete" size={18} color={lightColors.error} />
                <Text style={styles.removeReceiptText}>Remove Receipt</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.attachReceiptButton}
              onPress={showImagePickerOptions}
            >
              <MaterialIcons name="add-a-photo" size={24} color={lightColors.primary} />
              <Text style={styles.attachReceiptText}>Attach Receipt</Text>
            </TouchableOpacity>
          )}
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
            style={[styles.saveButton, (isSaving || isUploadingReceipt) && styles.saveDisabled]}
            onPress={handleSave}
            disabled={isSaving || isUploadingReceipt}
          >
            <Text style={styles.saveText}>
              {isUploadingReceipt ? 'Uploading...' : isSaving ? 'Saving...' : expenseId ? 'Update Expense' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══ Expense Type Picker Modal ═══ */}
      <Modal
        visible={showTypePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setShowTypePicker(false)}>
          <Pressable style={styles.pickerDialog} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>Select Expense Type</Text>
            <FlatList
              data={EXPENSE_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    form.type === item && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    updateField('type', item);
                    setShowTypePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      form.type === item && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {form.type === item && (
                    <MaterialIcons name="check" size={20} color={lightColors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══ Currency Picker Modal ═══ */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setShowCurrencyPicker(false)}>
          <Pressable style={styles.pickerDialog} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>Select Currency</Text>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    form.currency === item.value && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    updateField('currency', item.value);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      form.currency === item.value && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {form.currency === item.value && (
                    <MaterialIcons name="check" size={20} color={lightColors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
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

  // Dropdown button (for Type and Currency)
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

  dropdownButtonText: {
    fontSize: 16,
    color: lightColors.onSurface,
  },

  // Segmented button bar (Payment Method & Status)
  segmentedBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    borderRadius: borderRadii.md,
    overflow: 'hidden',
  },

  segmentedButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.surface,
    borderRightWidth: 1,
    borderRightColor: lightColors.outlineVariant,
  },

  segmentedButtonFirst: {
    borderTopLeftRadius: borderRadii.md,
    borderBottomLeftRadius: borderRadii.md,
  },

  segmentedButtonLast: {
    borderTopRightRadius: borderRadii.md,
    borderBottomRightRadius: borderRadii.md,
    borderRightWidth: 0,
  },

  segmentedButtonSelected: {
    backgroundColor: lightColors.primary,
  },

  segmentedButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: lightColors.onSurface,
  },

  segmentedButtonTextSelected: {
    color: lightColors.onPrimary,
    fontWeight: '600',
  },

  // Picker modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },

  pickerDialog: {
    width: '100%',
    maxHeight: 400,
    backgroundColor: lightColors.surface,
    borderRadius: borderRadii.lg,
    padding: spacing.xl,
  },

  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: lightColors.onSurface,
    marginBottom: spacing.lg,
  },

  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadii.sm,
  },

  pickerItemSelected: {
    backgroundColor: 'rgba(47, 62, 70, 0.08)',
  },

  pickerItemText: {
    fontSize: 16,
    color: lightColors.onSurface,
  },

  pickerItemTextSelected: {
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

  // Receipt attachment
  attachReceiptButton: {
    height: 120,
    borderWidth: 1,
    borderColor: lightColors.outlineVariant,
    borderRadius: borderRadii.md,
    backgroundColor: lightColors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },

  attachReceiptText: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.primary,
  },

  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadii.md,
  },

  removeReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },

  removeReceiptText: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.error,
  },
});
