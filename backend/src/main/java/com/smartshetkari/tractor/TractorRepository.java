package com.smartshetkari.tractor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TractorRepository extends JpaRepository<Tractor, Long> {

    List<Tractor> findByFarmerId(Long farmerId);

    Optional<Tractor> findByIdAndFarmerId(Long id, Long farmerId);

    long countByFarmerId(Long farmerId);
}
