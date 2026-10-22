package com.smartshetkari.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByFarmerId(Long farmerId);

    Optional<Employee> findByIdAndFarmerId(Long id, Long farmerId);

    long countByFarmerIdAndStatus(Long farmerId, Employee.EmploymentStatus status);

    @Query("SELECT e FROM Employee e WHERE e.farmerId = :farmerId " +
            "AND (:status IS NULL OR e.status = :status) " +
            "AND (:query IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "     OR LOWER(e.villageAddress) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY e.fullName ASC")
    List<Employee> searchEmployees(
            @Param("farmerId") Long farmerId,
            @Param("status") Employee.EmploymentStatus status,
            @Param("query") String query
    );
}
