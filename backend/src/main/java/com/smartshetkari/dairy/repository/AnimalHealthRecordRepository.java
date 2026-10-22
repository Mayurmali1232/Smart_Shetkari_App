package com.smartshetkari.dairy.repository;

import com.smartshetkari.dairy.AnimalHealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalHealthRecordRepository extends JpaRepository<AnimalHealthRecord, Long> {

    List<AnimalHealthRecord> findByFarmerIdOrderByRecordDateDesc(Long farmerId);

    List<AnimalHealthRecord> findByAnimalIdOrderByRecordDateDesc(Long animalId);

    Optional<AnimalHealthRecord> findByIdAndFarmerId(Long id, Long farmerId);

    @Query("SELECT h FROM AnimalHealthRecord h WHERE h.farmerId = :farmerId " +
            "AND h.nextDueDate IS NOT NULL AND h.nextDueDate BETWEEN :startDate AND :endDate " +
            "ORDER BY h.nextDueDate ASC")
    List<AnimalHealthRecord> findUpcomingReminders(@Param("farmerId") Long farmerId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT h FROM AnimalHealthRecord h WHERE h.farmerId = :farmerId " +
            "AND h.nextDueDate IS NOT NULL AND h.nextDueDate < :currentDate " +
            "ORDER BY h.nextDueDate ASC")
    List<AnimalHealthRecord> findOverdueReminders(@Param("farmerId") Long farmerId,
                                                 @Param("currentDate") LocalDate currentDate);
}
