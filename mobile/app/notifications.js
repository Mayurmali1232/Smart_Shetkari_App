import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { notificationService } from '../services/notificationService';
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      setError('');
      const res = await notificationService.list(unreadOnly);
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      // Ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      Alert.alert(t('common.success'), 'All notifications marked as read');
    } catch (e) {
      Alert.alert(t('common.error'), 'Could not mark all as read');
    }
  };

  const handleNotificationPress = (item) => {
    handleMarkAsRead(item.id);
    if (item.type === 'BOOKING_REMINDER') {
      router.push('/bookings');
    } else if (item.type === 'PAYMENT_DUE') {
      router.push('/wages');
    } else if (item.type === 'MAINTENANCE_DUE') {
      router.push('/tractors');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BOOKING_REMINDER':
        return '🚜';
      case 'PAYMENT_DUE':
        return '💰';
      case 'MAINTENANCE_DUE':
        return '🔧';
      default:
        return '📢';
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 22 }}>{getTypeIcon(item.type)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, isUnread && styles.unreadTitle]}>
                {item.title}
              </Text>
              {isUnread && <View style={styles.dot} />}
            </View>
            <Text style={styles.timeText}>
              {item.createdAt ? item.createdAt.replace('T', ' ').slice(0, 16) : 'Just now'}
            </Text>
          </View>
        </View>

        <Text style={styles.messageText}>{item.message}</Text>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
        showBack={true}
        showNotifications={false}
      />

      {/* Filter and Mark All Read Bar */}
      <View style={styles.actionBar}>
        <View style={styles.filterGroup}>
          <TouchableOpacity
            style={[styles.filterBtn, !unreadOnly && styles.filterBtnActive]}
            onPress={() => setUnreadOnly(false)}
          >
            <Text style={[styles.filterBtnText, !unreadOnly && styles.filterBtnTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, unreadOnly && styles.filterBtnActive]}
            onPress={() => setUnreadOnly(true)}
          >
            <Text style={[styles.filterBtnText, unreadOnly && styles.filterBtnTextActive]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {error ? <ErrorMessage message={error} onRetry={fetchNotifications} /> : null}

        {loading && !refreshing ? (
          <LoadingIndicator />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No Notifications"
            message={unreadOnly ? 'You have no unread notifications.' : 'You have no alerts at this time.'}
          />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  filterGroup: {
    flexDirection: 'row',
    gap: SPACING.xs
  },
  filterBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  filterBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  filterBtnText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  filterBtnTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700'
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm
  },
  markAllText: {
    fontSize: FONTS.small,
    color: COLORS.primary,
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  unreadCard: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1
  },
  unreadTitle: {
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.xs
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  messageText: {
    fontSize: FONTS.small,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    lineHeight: 18
  }
});
