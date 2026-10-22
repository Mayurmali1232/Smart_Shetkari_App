package com.smartshetkari.attendance;

import com.smartshetkari.attendance.dto.AttendanceRecordRequest;
import com.smartshetkari.attendance.dto.AttendanceResponse;
import com.smartshetkari.attendance.dto.AttendanceSummaryResponse;
import com.smartshetkari.attendance.dto.BulkAttendanceRequest;
import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.employee.Employee;
import com.smartshetkari.employee.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public AttendanceResponse recordSingleAttendance(Long farmerId, LocalDate workDate, AttendanceRecordRequest request) {
        Employee employee = employeeRepository.findByIdAndFarmerId(request.getEmployeeId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + request.getEmployeeId()));

        BigDecimal applicableRate = request.getDailyWageRate() != null
                ? request.getDailyWageRate()
                : employee.getDailyWage();

        Optional<Attendance> existingOpt = attendanceRepository.findByFarmerIdAndEmployeeIdAndWorkDate(farmerId, employee.getId(), workDate);
        Attendance attendance;

        if (existingOpt.isPresent()) {
            attendance = existingOpt.get();
            attendance.setStatus(request.getStatus());
            attendance.setDailyWageRate(applicableRate);
            attendance.setCheckInTime(request.getCheckInTime());
            attendance.setCheckOutTime(request.getCheckOutTime());
            attendance.setHoursWorked(request.getHoursWorked());
            attendance.setNotes(request.getNotes());
        } else {
            attendance = new Attendance(
                    farmerId,
                    employee,
                    workDate,
                    request.getStatus(),
                    applicableRate,
                    request.getCheckInTime(),
                    request.getCheckOutTime(),
                    request.getHoursWorked(),
                    request.getNotes()
            );
        }

        attendance = attendanceRepository.save(attendance);
        return mapToResponse(attendance);
    }

    @Transactional
    public List<AttendanceResponse> recordBulkAttendance(Long farmerId, BulkAttendanceRequest request) {
        List<AttendanceResponse> results = new ArrayList<>();
        LocalDate workDate = request.getWorkDate() != null ? request.getWorkDate() : LocalDate.now();

        for (AttendanceRecordRequest rec : request.getRecords()) {
            results.add(recordSingleAttendance(farmerId, workDate, rec));
        }

        return results;
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(Long farmerId, LocalDate workDate) {
        LocalDate date = workDate != null ? workDate : LocalDate.now();
        return attendanceRepository.findByFarmerIdAndWorkDate(farmerId, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getAttendanceSummary(Long farmerId, LocalDate date) {
        LocalDate workDate = date != null ? date : LocalDate.now();

        long totalWorkers = employeeRepository.countByFarmerIdAndStatus(farmerId, Employee.EmploymentStatus.ACTIVE);
        long present = attendanceRepository.countByFarmerIdAndWorkDateAndStatus(farmerId, workDate, Attendance.AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByFarmerIdAndWorkDateAndStatus(farmerId, workDate, Attendance.AttendanceStatus.ABSENT);
        long halfDay = attendanceRepository.countByFarmerIdAndWorkDateAndStatus(farmerId, workDate, Attendance.AttendanceStatus.HALF_DAY);
        long leave = attendanceRepository.countByFarmerIdAndWorkDateAndStatus(farmerId, workDate, Attendance.AttendanceStatus.LEAVE);

        // Calculate wages for the day
        List<Attendance> dayRecords = attendanceRepository.findByFarmerIdAndWorkDate(farmerId, workDate);
        BigDecimal totalWagesToday = BigDecimal.ZERO;

        for (Attendance a : dayRecords) {
            if (a.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                totalWagesToday = totalWagesToday.add(a.getDailyWageRate());
            } else if (a.getStatus() == Attendance.AttendanceStatus.HALF_DAY) {
                totalWagesToday = totalWagesToday.add(a.getDailyWageRate().multiply(new BigDecimal("0.5")));
            }
        }

        return new AttendanceSummaryResponse(workDate, totalWorkers, present, absent, halfDay, leave, totalWagesToday);
    }

    @Transactional
    public AttendanceResponse updateAttendance(Long farmerId, Long id, AttendanceRecordRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .filter(a -> a.getFarmerId().equals(farmerId))
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with ID: " + id));

        attendance.setStatus(request.getStatus());
        if (request.getDailyWageRate() != null) {
            attendance.setDailyWageRate(request.getDailyWageRate());
        }
        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());
        attendance.setHoursWorked(request.getHoursWorked());
        attendance.setNotes(request.getNotes());

        attendance = attendanceRepository.save(attendance);
        return mapToResponse(attendance);
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        AttendanceResponse res = new AttendanceResponse();
        res.setId(attendance.getId());
        res.setFarmerId(attendance.getFarmerId());
        res.setEmployeeId(attendance.getEmployee().getId());
        res.setEmployeeName(attendance.getEmployee().getFullName());
        res.setWorkDate(attendance.getWorkDate());
        res.setStatus(attendance.getStatus());
        res.setCheckInTime(attendance.getCheckInTime());
        res.setCheckOutTime(attendance.getCheckOutTime());
        res.setHoursWorked(attendance.getHoursWorked());
        res.setDailyWageRate(attendance.getDailyWageRate());
        res.setNotes(attendance.getNotes());
        return res;
    }
}
