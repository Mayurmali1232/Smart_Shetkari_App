import { Alert, Platform } from 'react-native';

// React Native Web provides an empty Alert.alert stub (static alert() {}).
// This polyfill ensures Alert.alert works reliably in Web browsers,
// invoking confirmation/cancel dialogs and executing the button onPress callbacks.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  Alert.alert = (title, message, buttons) => {
    const text = title
      ? (message ? `${title}\n\n${message}` : String(title))
      : (message ? String(message) : '');

    if (buttons && buttons.length > 0) {
      const cancelBtn = buttons.find((b) => b.style === 'cancel');
      const confirmBtn = buttons.find((b) => b.style !== 'cancel') || buttons[0];

      if (buttons.length > 1 && cancelBtn) {
        // Dual-action confirmation dialog (e.g., Cancel / Delete or Cancel / OK)
        const confirmed = window.confirm(text);
        if (confirmed) {
          if (confirmBtn && typeof confirmBtn.onPress === 'function') {
            confirmBtn.onPress();
          }
        } else {
          if (cancelBtn && typeof cancelBtn.onPress === 'function') {
            cancelBtn.onPress();
          }
        }
      } else {
        // Single-action notification / alert dialog (e.g. OK)
        window.alert(text);
        if (confirmBtn && typeof confirmBtn.onPress === 'function') {
          confirmBtn.onPress();
        }
      }
    } else {
      window.alert(text);
    }
  };
}

export default Alert;
