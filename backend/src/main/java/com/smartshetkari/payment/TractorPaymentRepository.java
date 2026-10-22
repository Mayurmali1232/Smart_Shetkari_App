package com.smartshetkari.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TractorPaymentRepository extends JpaRepository<TractorPayment, Long> {

    List<TractorPayment> findByFarmerIdOrderByPaymentDateDesc(Long farmerId);

    List<TractorPayment> findByFarmerIdAndBookingId(Long farmerId, Long bookingId);

    List<TractorPayment> findByFarmerIdAndPaymentDateBetween(Long farmerId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM TractorPayment p WHERE p.farmerId = :farmerId")
    BigDecimal sumTotalIncomeByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM TractorPayment p WHERE p.farmerId = :farmerId AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumIncomeByFarmerIdAndDateRange(
            @Param("farmerId") Long farmerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM TractorPayment p WHERE p.farmerId = :farmerId AND p.booking.id = :bookingId")
    BigDecimal sumPaidByBookingId(@Param("farmerId") Long farmerId, @Param("bookingId") Long bookingId);
}
