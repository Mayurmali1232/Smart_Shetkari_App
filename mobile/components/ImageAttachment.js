import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Platform, TextInput } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import AppButton from './AppButton';

export default function ImageAttachment({
  value,
  onChange,
  label = 'Attach Photo / Document',
  placeholderIcon = '📷',
  hint = 'Upload photo or bill receipt'
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlText, setUrlText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (Platform.OS === 'web') {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            onChange(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const triggerUpload = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setShowUrlInput(true);
    }
  };

  const handleApplyUrl = () => {
    if (urlText.trim()) {
      onChange(urlText.trim());
      setUrlText('');
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Hidden file input for Web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {value ? (
        <View style={styles.previewContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: value }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.zoomBadge}>
              <Text style={styles.zoomIcon}>🔍</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.previewInfo}>
            <Text style={styles.previewSuccessText}>✅ Image Attached</Text>
            <Text style={styles.previewSubText}>Tap image to view full size</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={triggerUpload}
                activeOpacity={0.7}
              >
                <Text style={styles.changeBtnText}>Change Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={handleRemove}
                activeOpacity={0.7}
              >
                <Text style={styles.removeBtnText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.uploadBox}>
          <TouchableOpacity
            style={styles.dashedCard}
            onPress={triggerUpload}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{placeholderIcon}</Text>
            <Text style={styles.uploadTitle}>Take Photo / Upload Image</Text>
            <Text style={styles.uploadSubtitle}>{hint}</Text>
          </TouchableOpacity>

          {/* Toggle URL input */}
          <TouchableOpacity
            style={styles.toggleUrlBtn}
            onPress={() => setShowUrlInput(!showUrlInput)}
          >
            <Text style={styles.toggleUrlText}>
              {showUrlInput ? 'Hide URL input' : 'Or paste image URL / वेब लिंक जोडा'}
            </Text>
          </TouchableOpacity>

          {showUrlInput && (
            <View style={styles.urlInputRow}>
              <TextInput
                style={styles.urlInput}
                placeholder="https://example.com/photo.jpg"
                placeholderTextColor={COLORS.textMuted}
                value={urlText}
                onChangeText={setUrlText}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.urlSaveBtn}
                onPress={handleApplyUrl}
              >
                <Text style={styles.urlSaveBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Full Image Preview Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fullImageContainer}>
              {value && (
                <Image
                  source={{ uri: value }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs
  },
  label: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  imageWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  zoomIcon: {
    fontSize: 10,
    color: '#ffffff'
  },
  previewInfo: {
    flex: 1,
    marginLeft: SPACING.sm
  },
  previewSuccessText: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.primary
  },
  previewSubText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  changeBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.info
  },
  removeBtn: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  removeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.danger
  },
  uploadBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    padding: SPACING.md,
    alignItems: 'center'
  },
  dashedCard: {
    alignItems: 'center',
    width: '100%'
  },
  icon: {
    fontSize: 32,
    marginBottom: SPACING.xs
  },
  uploadTitle: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.primary
  },
  uploadSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  toggleUrlBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 4
  },
  toggleUrlText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'underline'
  },
  urlInputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
    marginTop: SPACING.xs
  },
  urlInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: FONTS.small,
    color: COLORS.textPrimary
  },
  urlSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  urlSaveBtnText: {
    color: '#ffffff',
    fontSize: FONTS.small,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight
  },
  modalTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm
  },
  closeBtnText: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  fullImageContainer: {
    width: '100%',
    height: 420,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fullImage: {
    width: '100%',
    height: '100%'
  }
});