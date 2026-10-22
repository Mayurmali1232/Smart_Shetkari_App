package com.smartshetkari.employee;

import com.smartshetkari.attendance.Attendance;
import com.smartshetkari.attendance.AttendanceRepository;
import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.employee.dto.EmployeeRequest;
import com.smartshetkari.employee.dto.EmployeeResponse;
import com.smartshetkari.wage.WagePayment;
import com.smartshetkari.wage.WagePaymentRepository;
import com.smartshetkari.wage.WageRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final WageRecordRepository wageRecordRepository;
    private final WagePaymentRepository wagePaymentRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                           AttendanceRepository attendanceRepository,
                           WageRecordRepository wageRecordRepository,
                           WagePaymentRepository wagePaymentRepository) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.wageRecordRepository = wageRecordRepository;
        this.wagePaymentRepository = wagePaymentRepository;
    }

    @Transactional
    public EmployeeResponse createEmployee(Long farmerId, EmployeeRequest request) {
        Employee employee = new Employee(
                farmerId,
                request.getFullName(),
                request.getMobileNumber(),
                request.getVillageAddress(),
                request.getDailyWage(),
                request.getWageType(),
                request.getJoiningDate() != null ? request.getJoiningDate() : LocalDate.now(),
                request.getStatus(),
                request.getNotes()
        );

        employee = employeeRepository.save(employee);
        return mapToResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long farmerId, Long employeeId, EmployeeRequest request) {
        Employee employee = employeeRepository.findByIdAndFarmerId(employeeId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + employeeId));

        employee.setFullName(request.getFullName());
        employee.setMobileNumber(request.getMobileNumber());
        employee.setVillageAddress(request.getVillageAddress());
        // Important: Changing dailyWage changes current rate for future attendance only!
        employee.setDailyWage(request.getDailyWage());
        employee.setWageType(request.getWageType());
        if (request.getJoiningDate() != null) {
            employee.setJoiningDate(request.getJoiningDate());
        }
        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }
        employee.setNotes(request.getNotes());

        employee = employeeRepository.save(employee);
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long farmerId, Long employeeId) {
        Employee employee = employeeRepository.findByIdAndFarmerId(employeeId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + employeeId));

        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> listEmployees(Long farmerId, Employee.EmploymentStatus status, String query) {
        List<Employee> employees = employeeRepository.searchEmployees(
                farmerId,
                status,
                query != null && !query.trim().isEmpty() ? query.trim() : null
        );

        return employees.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeResponse toggleStatus(Long farmerId, Long employeeId, Employee.EmploymentStatus status) {
        Employee employee = employeeRepository.findByIdAndFarmerId(employeeId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + employeeId));

        employee.setStatus(status);
        employee = employeeRepository.save(employee);
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getWorkHistory(Long farmerId, Long employeeId) {
        Employee employee = employeeRepository.findByIdAndFarmerId(employeeId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + employeeId));

        List<Attendance> attendances = attendanceRepository.findByFarmerIdAndEmployeeIdOrderByWorkDateDesc(farmerId, employeeId);
        List<WagePayment> payments = wagePaymentRepository.findByFarmerIdAndEmployeeIdOrderByPaymentDateDesc(farmerId, employeeId);

        Map<String, Object> history = new HashMap<>();
        history.put("employee", mapToResponse(employee));
        history.put("attendanceRecords", attendances);
        history.put("paymentRecords", payments);

        return history;
    }

    public EmployeeResponse mapToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setFarmerId(employee.getFarmerId());
        response.setFullName(employee.getFullName());
        response.setMobileNumber(employee.getMobileNumber());
        response.setVillageAddress(employee.getVillageAddress());
        response.setDailyWage(employee.getDailyWage());
        response.setWageType(employee.getWageType());
        response.setJoiningDate(employee.getJoiningDate());
        response.setStatus(employee.getStatus());
        response.setNotes(employee.getNotes());
        response.setCreatedAt(employee.getCreatedAt());
        response.setUpdatedAt(employee.getUpdatedAt());

        // Calculate financial summaries
        long workedDays = attendanceRepository.countWorkingDaysByFarmerIdAndEmployeeId(employee.getFarmerId(), employee.getId());
        response.setTotalDaysWorked(workedDays);

        BigDecimal totalAgreed = wageRecordRepository.sumFinalAgreedWageByFarmerIdAndEmployeeId(employee.getFarmerId(), employee.getId());
        BigDecimal totalPaid = wagePaymentRepository.sumPaidByFarmerIdAndEmployeeId(employee.getFarmerId(), employee.getId());

        response.setTotalWagesEarned(totalAgreed);
        response.setTotalPaid(totalPaid);
        response.setOutstandingBalance(totalAgreed.subtract(totalPaid));

        return response;
    }
}
