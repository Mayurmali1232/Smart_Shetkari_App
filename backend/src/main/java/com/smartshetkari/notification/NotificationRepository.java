package com.smartshetkari.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    List<Notification> findByFarmerIdAndIsReadFalseOrderByCreatedAtDesc(Long farmerId);

    long countByFarmerIdAndIsReadFalse(Long farmerId);
}
