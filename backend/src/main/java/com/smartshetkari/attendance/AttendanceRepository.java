package com.smartshetkari.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByFarmerIdAndWorkDate(Long farmerId, LocalDate workDate);

    Optional<Attendance> findByFarmerIdAndEmployeeIdAndWorkDate(Long farmerId, Long employeeId, LocalDate workDate);

    List<Attendance> findByFarmerIdAndEmployeeIdAndWorkDateBetween(Long farmerId, Long employeeId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByFarmerIdAndWorkDateBetween(Long farmerId, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByFarmerIdAndEmployeeIdOrderByWorkDateDesc(Long farmerId, Long employeeId);

    long countByFarmerIdAndWorkDateAndStatus(Long farmerId, LocalDate workDate, Attendance.AttendanceStatus status);

    long countByFarmerIdAndEmployeeId(Long farmerId, Long employeeId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.farmerId = :farmerId AND a.employee.id = :employeeId AND a.status IN ('PRESENT', 'HALF_DAY')")
    long countWorkingDaysByFarmerIdAndEmployeeId(@Param("farmerId") Long farmerId, @Param("employeeId") Long employeeId);
}
