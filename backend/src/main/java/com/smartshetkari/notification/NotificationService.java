package com.smartshetkari.notification;

import com.smartshetkari.booking.BookingRepository;
import com.smartshetkari.booking.TractorBooking;
import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.notification.dto.NotificationResponse;
import com.smartshetkari.wage.WageRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final BookingRepository bookingRepository;
    private final WageRecordRepository wageRecordRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               BookingRepository bookingRepository,
                               WageRecordRepository wageRecordRepository) {
        this.notificationRepository = notificationRepository;
        this.bookingRepository = bookingRepository;
        this.wageRecordRepository = wageRecordRepository;
    }

    @Transactional
    public List<NotificationResponse> getNotifications(Long farmerId, boolean unreadOnly) {
        // Auto-generate reminders if none exist recently
        generateRemindersIfNeeded(farmerId);

        List<Notification> list = unreadOnly
                ? notificationRepository.findByFarmerIdAndIsReadFalseOrderByCreatedAtDesc(farmerId)
                : notificationRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);

        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long farmerId, Long id) {
        Notification notification = notificationRepository.findById(id)
                .filter(n -> n.getFarmerId().equals(farmerId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long farmerId) {
        List<Notification> unread = notificationRepository.findByFarmerIdAndIsReadFalseOrderByCreatedAtDesc(farmerId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void generateRemindersIfNeeded(Long farmerId) {
        long count = notificationRepository.countByFarmerIdAndIsReadFalse(farmerId);
        if (count > 0) {
            return;
        }

        // Check today's bookings
        List<TractorBooking> todayBookings = bookingRepository.findByFarmerIdAndWorkDate(farmerId, LocalDate.now());
        for (TractorBooking b : todayBookings) {
            if (b.getStatus() == TractorBooking.BookingStatus.CONFIRMED) {
                String workName = (b.getCustomWorkType() != null && !b.getCustomWorkType().isBlank())
                        ? b.getCustomWorkType()
                        : (b.getWorkType() != null ? b.getWorkType().name() : "Work");
                notificationRepository.save(new Notification(
                        farmerId,
                        "Today's Booking Reminder",
                        "You have a tractor booking for " + b.getCustomerName() + " (" + workName + ") scheduled for today.",
                        Notification.NotificationType.BOOKING_REMINDER
                ));
            }
        }
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setFarmerId(n.getFarmerId());
        res.setTitle(n.getTitle());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setRead(n.isRead());
        res.setCreatedAt(n.getCreatedAt());
        return res;
    }
}
