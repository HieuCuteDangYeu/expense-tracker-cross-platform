/**
 * Maps expense type → icon name + background/tint colors.
 * Extracted exactly from ExpenseUiUtils.kt getIconAndColorsForType().
 *
 * Uses @expo/vector-icons MaterialIcons names.
 */

export type IconColorMapping = {
  iconName: string;
  bgColor: string;
  tintColor: string;
};

export function getIconAndColorsForType(type: string): IconColorMapping {
  switch (type.toLowerCase()) {
    case 'travel':
      return { iconName: 'person', bgColor: '#DBEAFE', tintColor: '#2563EB' };       // blue-100, blue-600
    case 'equipment':
      return { iconName: 'build', bgColor: '#FFEDD5', tintColor: '#EA580C' };        // orange-100, orange-600
    case 'materials':
      return { iconName: 'shopping-cart', bgColor: '#F3E8FF', tintColor: '#9333EA' }; // purple-100, purple-600
    case 'services':
      return { iconName: 'list', bgColor: '#E0E7FF', tintColor: '#4F46E5' };          // indigo-100, indigo-600
    case 'software':
      return { iconName: 'settings', bgColor: '#DCFCE7', tintColor: '#16A34A' };      // green-100, green-600
    case 'labour':
      return { iconName: 'star', bgColor: '#FCE7F3', tintColor: '#DB2777' };          // pink-100, pink-600
    case 'utilities':
      return { iconName: 'warning', bgColor: '#FEF9C3', tintColor: '#CA8A04' };       // yellow-100, yellow-600
    default: // Misc
      return { iconName: 'info', bgColor: '#F1F5F9', tintColor: '#475569' };          // slate-100, slate-600
  }
}

/**
 * Maps payment status → background + text colors.
 * Extracted exactly from ExpenseUiUtils.kt getColorsForStatus().
 */
export type StatusColorMapping = {
  bgColor: string;
  textColor: string;
};

export function getColorsForStatus(status: string): StatusColorMapping {
  switch (status.toLowerCase()) {
    case 'paid':
      return { bgColor: '#DCFCE7', textColor: '#15803D' };    // green-100, green-700
    case 'pending':
      return { bgColor: '#FEF3C7', textColor: '#B45309' };    // amber-100, amber-700
    case 'reimbursed':
      return { bgColor: '#DBEAFE', textColor: '#1D4ED8' };    // blue-100, blue-700
    default:
      return { bgColor: '#F1F5F9', textColor: '#475569' };    // slate
  }
}
