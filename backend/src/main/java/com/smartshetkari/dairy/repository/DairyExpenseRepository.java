package com.smartshetkari.dairy.repository;

import com.smartshetkari.dairy.DairyExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DairyExpenseRepository extends JpaRepository<DairyExpense, Long> {

    List<DairyExpense> findByFarmerIdOrderByExpenseDateDesc(Long farmerId);

    List<DairyExpense> findByFarmerIdAndExpenseDateBetweenOrderByExpenseDateDesc(Long farmerId, LocalDate startDate, LocalDate endDate);

    List<DairyExpense> findByAnimalIdOrderByExpenseDateDesc(Long animalId);

    Optional<DairyExpense> findByIdAndFarmerId(Long id, Long farmerId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM DairyExpense e WHERE e.farmerId = :farmerId AND e.expenseDate = :date AND e.isCapitalExpense = false")
    BigDecimal sumOperatingExpensesByDate(@Param("farmerId") Long farmerId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM DairyExpense e WHERE e.farmerId = :farmerId AND e.expenseDate BETWEEN :startDate AND :endDate AND e.isCapitalExpense = false")
    BigDecimal sumOperatingExpensesBetween(@Param("farmerId") Long farmerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM DairyExpense e WHERE e.farmerId = :farmerId AND e.expenseDate BETWEEN :startDate AND :endDate AND e.isCapitalExpense = true")
    BigDecimal sumCapitalExpensesBetween(@Param("farmerId") Long farmerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM DairyExpense e WHERE e.animal.id = :animalId")
    BigDecimal sumExpensesByAnimal(@Param("animalId") Long animalId);

    @Query("SELECT e.category, SUM(e.amount) FROM DairyExpense e WHERE e.farmerId = :farmerId AND e.expenseDate BETWEEN :startDate AND :endDate GROUP BY e.category")
    List<Object[]> sumByCategoryBetween(@Param("farmerId") Long farmerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
