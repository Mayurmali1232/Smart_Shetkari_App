package com.smartshetkari.dairy.repository;

import com.smartshetkari.dairy.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    List<Animal> findByFarmerIdAndStatusOrderByCreatedAtDesc(Long farmerId, Animal.AnimalStatus status);

    List<Animal> findByFarmerIdAndAnimalTypeAndStatusOrderByCreatedAtDesc(Long farmerId, Animal.AnimalType animalType, Animal.AnimalStatus status);

    Optional<Animal> findByIdAndFarmerId(Long id, Long farmerId);

    long countByFarmerIdAndStatus(Long farmerId, Animal.AnimalStatus status);

    long countByFarmerIdAndAnimalTypeAndStatus(Long farmerId, Animal.AnimalType animalType, Animal.AnimalStatus status);

    long countByFarmerIdAndMilkingStatusAndStatus(Long farmerId, Animal.MilkingStatus milkingStatus, Animal.AnimalStatus status);

    @Query("SELECT a FROM Animal a WHERE a.farmerId = :farmerId " +
            "AND (:type IS NULL OR a.animalType = :type) " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:milkingStatus IS NULL OR a.milkingStatus = :milkingStatus) " +
            "ORDER BY a.name ASC")
    List<Animal> filterAnimals(@Param("farmerId") Long farmerId,
                              @Param("type") Animal.AnimalType type,
                              @Param("status") Animal.AnimalStatus status,
                              @Param("milkingStatus") Animal.MilkingStatus milkingStatus);
}
