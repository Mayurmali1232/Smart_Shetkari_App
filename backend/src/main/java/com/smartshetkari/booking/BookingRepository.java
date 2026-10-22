package com.smartshetkari.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<TractorBooking, Long> {

    List<TractorBooking> findByFarmerIdOrderByWorkDateDesc(Long farmerId);

    List<TractorBooking> findByFarmerIdAndStatusOrderByWorkDateDesc(Long farmerId, TractorBooking.BookingStatus status);

    List<TractorBooking> findByFarmerIdAndTractorIdOrderByWorkDateDesc(Long farmerId, Long tractorId);

    List<TractorBooking> findByFarmerIdAndWorkDate(Long farmerId, LocalDate workDate);

    Optional<TractorBooking> findByIdAndFarmerId(Long id, Long farmerId);

    long countByFarmerIdAndWorkDate(Long farmerId, LocalDate workDate);

    @Query("SELECT COUNT(b) FROM TractorBooking b " +
            "WHERE b.farmerId = :farmerId " +
            "AND b.tractor.id = :tractorId " +
            "AND b.workDate = :workDate " +
            "AND b.status IN ('CONFIRMED', 'IN_PROGRESS') " +
            "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId) " +
            "AND ((:startTime IS NULL OR :endTime IS NULL) " +
            "     OR (b.startTime IS NULL OR b.endTime IS NULL) " +
            "     OR (b.startTime < :endTime AND b.endTime > :startTime))")
    long countOverlappingConfirmedBookings(
            @Param("farmerId") Long farmerId,
            @Param("tractorId") Long tractorId,
            @Param("workDate") LocalDate workDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeBookingId") Long excludeBookingId
    );

    @Query("SELECT COALESCE(SUM(b.finalAgreedAmount), 0) FROM TractorBooking b WHERE b.farmerId = :farmerId AND b.status = 'COMPLETED'")
    BigDecimal sumCompletedBookingsValueByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT COALESCE(SUM(b.finalAgreedAmount), 0) FROM TractorBooking b " +
            "WHERE b.farmerId = :farmerId AND b.status = 'COMPLETED' " +
            "AND b.workDate BETWEEN :startDate AND :endDate")
    BigDecimal sumCompletedBookingsValueByFarmerIdAndDateRange(
            @Param("farmerId") Long farmerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
