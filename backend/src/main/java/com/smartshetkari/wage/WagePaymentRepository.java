package com.smartshetkari.wage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface WagePaymentRepository extends JpaRepository<WagePayment, Long> {

    List<WagePayment> findByFarmerIdOrderByPaymentDateDesc(Long farmerId);

    List<WagePayment> findByFarmerIdAndEmployeeIdOrderByPaymentDateDesc(Long farmerId, Long employeeId);

    List<WagePayment> findByWageRecordId(Long wageRecordId);

    List<WagePayment> findByFarmerIdAndPaymentDateBetween(Long farmerId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM WagePayment p WHERE p.farmerId = :farmerId AND p.employee.id = :employeeId")
    BigDecimal sumPaidByFarmerIdAndEmployeeId(@Param("farmerId") Long farmerId, @Param("employeeId") Long employeeId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM WagePayment p WHERE p.farmerId = :farmerId")
    BigDecimal sumTotalPaidByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM WagePayment p WHERE p.farmerId = :farmerId AND p.paymentDate = :paymentDate")
    BigDecimal sumPaidByFarmerIdAndDate(@Param("farmerId") Long farmerId, @Param("paymentDate") LocalDate paymentDate);
}
