package com.smartshetkari.wage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WageRecordRepository extends JpaRepository<WageRecord, Long> {

    List<WageRecord> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    List<WageRecord> findByFarmerIdAndEmployeeIdOrderByCreatedAtDesc(Long farmerId, Long employeeId);

    Optional<WageRecord> findFirstByFarmerIdAndEmployeeIdOrderByEndDateDesc(Long farmerId, Long employeeId);

    List<WageRecord> findByFarmerIdAndEmployeeIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long farmerId, Long employeeId, LocalDate endDate, LocalDate startDate);

    Optional<WageRecord> findByIdAndFarmerId(Long id, Long farmerId);

    List<WageRecord> findByFarmerIdAndStartDateGreaterThanEqualAndEndDateLessThanEqual(
            Long farmerId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(w.finalAgreedWage), 0) FROM WageRecord w WHERE w.farmerId = :farmerId AND w.employee.id = :employeeId")
    BigDecimal sumFinalAgreedWageByFarmerIdAndEmployeeId(@Param("farmerId") Long farmerId, @Param("employeeId") Long employeeId);

    @Query("SELECT COALESCE(SUM(w.finalAgreedWage), 0) FROM WageRecord w WHERE w.farmerId = :farmerId")
    BigDecimal sumTotalWagesByFarmerId(@Param("farmerId") Long farmerId);
}
