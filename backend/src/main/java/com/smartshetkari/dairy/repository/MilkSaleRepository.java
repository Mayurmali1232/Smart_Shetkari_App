package com.smartshetkari.dairy.repository;

import com.smartshetkari.dairy.MilkSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MilkSaleRepository extends JpaRepository<MilkSale, Long> {

    List<MilkSale> findByFarmerIdOrderBySaleDateDesc(Long farmerId);

    List<MilkSale> findByFarmerIdAndSaleDateBetweenOrderBySaleDateDesc(Long farmerId, LocalDate startDate, LocalDate endDate);

    List<MilkSale> findByFarmerIdAndPaymentStatusOrderBySaleDateDesc(Long farmerId, MilkSale.PaymentStatus paymentStatus);

    Optional<MilkSale> findByIdAndFarmerId(Long id, Long farmerId);

    @Query("SELECT COALESCE(SUM(s.quantityLiters), 0) FROM MilkSale s WHERE s.farmerId = :farmerId AND s.saleDate = :date")
    BigDecimal sumQuantitySoldByDate(@Param("farmerId") Long farmerId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM MilkSale s WHERE s.farmerId = :farmerId AND s.saleDate = :date")
    BigDecimal sumTotalSalesByDate(@Param("farmerId") Long farmerId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(s.quantityLiters), 0) FROM MilkSale s WHERE s.farmerId = :farmerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantitySoldBetween(@Param("farmerId") Long farmerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM MilkSale s WHERE s.farmerId = :farmerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalSalesBetween(@Param("farmerId") Long farmerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.paidAmount), 0) FROM MilkSale s WHERE s.farmerId = :farmerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumPaidSalesBetween(@Param("farmerId") Long farmerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.totalAmount - s.paidAmount), 0) FROM MilkSale s WHERE s.farmerId = :farmerId AND s.paymentStatus <> 'PAID'")
    BigDecimal sumOutstandingReceivables(@Param("farmerId") Long farmerId);
}
