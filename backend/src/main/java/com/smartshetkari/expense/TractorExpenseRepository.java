package com.smartshetkari.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TractorExpenseRepository extends JpaRepository<TractorExpense, Long> {

    List<TractorExpense> findByFarmerIdOrderByExpenseDateDesc(Long farmerId);

    List<TractorExpense> findByFarmerIdAndTractorIdOrderByExpenseDateDesc(Long farmerId, Long tractorId);

    List<TractorExpense> findByFarmerIdAndCategory(Long farmerId, TractorExpense.ExpenseCategory category);

    List<TractorExpense> findByFarmerIdAndExpenseDateBetween(Long farmerId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM TractorExpense e WHERE e.farmerId = :farmerId")
    BigDecimal sumTotalExpensesByFarmerId(@Param("farmerId") Long farmerId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM TractorExpense e WHERE e.farmerId = :farmerId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesByFarmerIdAndDateRange(
            @Param("farmerId") Long farmerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
