package com.smartshetkari.dairy.repository;

import com.smartshetkari.dairy.MilkUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MilkUsageRepository extends JpaRepository<MilkUsage, Long> {

    Optional<MilkUsage> findByFarmerIdAndUsageDate(Long farmerId, LocalDate usageDate);

    List<MilkUsage> findByFarmerIdAndUsageDateBetweenOrderByUsageDateDesc(Long farmerId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(u.homeConsumptionLiters + u.calfFeedingLiters + u.wastedLiters), 0) " +
            "FROM MilkUsage u WHERE u.farmerId = :farmerId AND u.usageDate = :date")
    BigDecimal sumTotalUsageByDate(@Param("farmerId") Long farmerId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(u.homeConsumptionLiters + u.calfFeedingLiters + u.wastedLiters), 0) " +
            "FROM MilkUsage u WHERE u.farmerId = :farmerId AND u.usageDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalUsageBetween(@Param("farmerId") Long farmerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
