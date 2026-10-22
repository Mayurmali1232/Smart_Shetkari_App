package com.smartshetkari.dairy.repository;

import com.smartshetkari.dairy.MilkProduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MilkProductionRepository extends JpaRepository<MilkProduction, Long> {

    List<MilkProduction> findByFarmerIdAndProductionDateOrderByAnimalNameAsc(Long farmerId, LocalDate productionDate);

    List<MilkProduction> findByFarmerIdAndProductionDateBetweenOrderByProductionDateDesc(Long farmerId, LocalDate startDate, LocalDate endDate);

    List<MilkProduction> findByAnimalIdOrderByProductionDateDesc(Long animalId);

    Optional<MilkProduction> findByAnimalIdAndProductionDate(Long animalId, LocalDate productionDate);

    Optional<MilkProduction> findByIdAndFarmerId(Long id, Long farmerId);

    @Query("SELECT COALESCE(SUM(m.totalLiters), 0) FROM MilkProduction m WHERE m.farmerId = :farmerId AND m.productionDate = :date")
    BigDecimal sumTotalLitersByDate(@Param("farmerId") Long farmerId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(m.totalLiters), 0) FROM MilkProduction m WHERE m.farmerId = :farmerId AND m.productionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalLitersBetween(@Param("farmerId") Long farmerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(m.totalLiters), 0) FROM MilkProduction m WHERE m.animal.id = :animalId")
    BigDecimal sumTotalLitersByAnimal(@Param("animalId") Long animalId);

    @Query("SELECT m.productionDate, SUM(m.morningLiters), SUM(m.eveningLiters), SUM(m.totalLiters) " +
            "FROM MilkProduction m WHERE m.farmerId = :farmerId AND m.productionDate BETWEEN :startDate AND :endDate " +
            "GROUP BY m.productionDate ORDER BY m.productionDate ASC")
    List<Object[]> getDailyProductionTrend(@Param("farmerId") Long farmerId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);
}
