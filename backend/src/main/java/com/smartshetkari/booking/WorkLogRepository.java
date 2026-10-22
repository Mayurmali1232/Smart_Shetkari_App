package com.smartshetkari.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkLogRepository extends JpaRepository<TractorWorkLog, Long> {
    Optional<TractorWorkLog> findByBookingId(Long bookingId);
}
