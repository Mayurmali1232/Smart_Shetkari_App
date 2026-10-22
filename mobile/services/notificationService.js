import api from './api';

export const notificationService = {
  list: (unreadOnly = false) => api.get('/notifications', { params: { unreadOnly } }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};
