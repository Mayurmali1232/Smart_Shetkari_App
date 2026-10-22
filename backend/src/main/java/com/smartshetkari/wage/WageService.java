package com.smartshetkari.wage;

import com.smartshetkari.attendance.Attendance;
import com.smartshetkari.attendance.AttendanceRepository;
import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.employee.Employee;
import com.smartshetkari.employee.EmployeeRepository;
import com.smartshetkari.wage.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WageService {

    private final WageRecordRepository wageRecordRepository;
    private final WagePaymentRepository wagePaymentRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    public WageService(WageRecordRepository wageRecordRepository,
                       WagePaymentRepository wagePaymentRepository,
                       EmployeeRepository employeeRepository,
                       AttendanceRepository attendanceRepository) {
        this.wageRecordRepository = wageRecordRepository;
        this.wagePaymentRepository = wagePaymentRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Transactional(readOnly = true)
    public WageCalculationResponse calculateSuggestedWage(Long farmerId, WageCalculationRequest request) {
        Employee employee = employeeRepository.findByIdAndFarmerId(request.getEmployeeId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + request.getEmployeeId()));

        List<Attendance> attendances = attendanceRepository.findByFarmerIdAndEmployeeIdAndWorkDateBetween(
                farmerId, employee.getId(), request.getStartDate(), request.getEndDate()
        );

        long presentDays = 0;
        long halfDays = 0;
        BigDecimal suggestedTotal = BigDecimal.ZERO;

        for (Attendance a : attendances) {
            if (a.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                presentDays++;
                suggestedTotal = suggestedTotal.add(a.getDailyWageRate());
            } else if (a.getStatus() == Attendance.AttendanceStatus.HALF_DAY) {
                halfDays++;
                suggestedTotal = suggestedTotal.add(a.getDailyWageRate().multiply(new BigDecimal("0.5")));
            }
        }

        double totalDaysWorked = presentDays + (halfDays * 0.5);

        long calendarDays = 0;
        if (request.getStartDate() != null && request.getEndDate() != null && !request.getEndDate().isBefore(request.getStartDate())) {
            calendarDays = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        }

        BigDecimal dailyWage = employee.getDailyWage() != null ? employee.getDailyWage() : BigDecimal.ZERO;
        BigDecimal periodEstimatedWage = dailyWage.multiply(BigDecimal.valueOf(calendarDays));

        boolean hasAttendanceRecords = !attendances.isEmpty();
        BigDecimal finalSuggested;

        if (hasAttendanceRecords && totalDaysWorked > 0) {
            finalSuggested = suggestedTotal;
        } else {
            finalSuggested = periodEstimatedWage;
            totalDaysWorked = (double) calendarDays;
        }

        WageCalculationResponse response = new WageCalculationResponse(
                employee.getId(),
                employee.getFullName(),
                request.getStartDate(),
                request.getEndDate(),
                presentDays,
                halfDays,
                totalDaysWorked,
                dailyWage,
                finalSuggested,
                calendarDays,
                hasAttendanceRecords,
                periodEstimatedWage
        );

        // Check if there are overlapping wage records already saved for this worker
        List<WageRecord> overlapping = wageRecordRepository
                .findByFarmerIdAndEmployeeIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        farmerId, employee.getId(), request.getEndDate(), request.getStartDate()
                );

        if (!overlapping.isEmpty()) {
            WageRecord existing = overlapping.get(0);
            response.setAlreadyCalculated(true);
            response.setExistingWageRecordId(existing.getId());
            response.setExistingAgreedWage(existing.getFinalAgreedWage());
            response.setExistingStartDate(existing.getStartDate());
            response.setExistingEndDate(existing.getEndDate());
        }

        return response;
    }

    @Transactional
    public WageRecordResponse createWageRecord(Long farmerId, CreateWageRecordRequest request) {
        Employee employee = employeeRepository.findByIdAndFarmerId(request.getEmployeeId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + request.getEmployeeId()));

        List<Attendance> attendances = attendanceRepository.findByFarmerIdAndEmployeeIdAndWorkDateBetween(
                farmerId, employee.getId(), request.getStartDate(), request.getEndDate()
        );

        long presentDays = 0;
        long halfDays = 0;
        for (Attendance a : attendances) {
            if (a.getStatus() == Attendance.AttendanceStatus.PRESENT) presentDays++;
            else if (a.getStatus() == Attendance.AttendanceStatus.HALF_DAY) halfDays++;
        }
        double totalDays = presentDays + (halfDays * 0.5);

        // If no attendance records existed or autoRecordAttendance is enabled, auto-fill missing attendance as PRESENT
        if (attendances.isEmpty() || Boolean.TRUE.equals(request.getAutoRecordAttendance())) {
            LocalDate cur = request.getStartDate();
            while (!cur.isAfter(request.getEndDate())) {
                boolean alreadyRecorded = attendanceRepository
                        .findByFarmerIdAndEmployeeIdAndWorkDate(farmerId, employee.getId(), cur)
                        .isPresent();
                if (!alreadyRecorded) {
                    Attendance newAtt = new Attendance(
                            farmerId,
                            employee,
                            cur,
                            Attendance.AttendanceStatus.PRESENT,
                            employee.getDailyWage() != null ? employee.getDailyWage() : BigDecimal.ZERO,
                            null, null, null,
                            "Settled in wage record (" + request.getStartDate() + " to " + request.getEndDate() + ")"
                    );
                    attendanceRepository.save(newAtt);
                    presentDays++;
                }
                cur = cur.plusDays(1);
            }
            totalDays = presentDays + (halfDays * 0.5);
        }

        // Check for existing overlapping wage record to update instead of creating a duplicate
        List<WageRecord> overlapping = wageRecordRepository
                .findByFarmerIdAndEmployeeIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        farmerId, employee.getId(), request.getEndDate(), request.getStartDate()
                );

        WageRecord record;
        if (!overlapping.isEmpty()) {
            record = overlapping.get(0);
            record.setStartDate(request.getStartDate());
            record.setEndDate(request.getEndDate());
            record.setTotalDaysWorked(totalDays);
            record.setSuggestedWage(request.getSuggestedWage());
            record.setFinalAgreedWage(request.getFinalAgreedWage());
            if (request.getNotes() != null) {
                record.setNotes(request.getNotes());
            }
        } else {
            record = new WageRecord(
                    farmerId,
                    employee,
                    request.getStartDate(),
                    request.getEndDate(),
                    totalDays,
                    request.getSuggestedWage(),
                    request.getFinalAgreedWage(),
                    request.getNotes()
            );
        }

        record = wageRecordRepository.save(record);
        return mapRecordToResponse(record);
    }

    @Transactional
    public void deleteWageRecord(Long farmerId, Long recordId) {
        WageRecord record = wageRecordRepository.findByIdAndFarmerId(recordId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Wage record not found with ID: " + recordId));

        List<WagePayment> payments = wagePaymentRepository.findByWageRecordId(recordId);
        for (WagePayment p : payments) {
            p.setWageRecord(null);
            wagePaymentRepository.save(p);
        }

        wageRecordRepository.delete(record);
    }

    @Transactional
    public WagePaymentResponse recordPayment(Long farmerId, WagePaymentRequest request) {
        Employee employee = employeeRepository.findByIdAndFarmerId(request.getEmployeeId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + request.getEmployeeId()));

        WageRecord record = null;
        if (request.getWageRecordId() != null) {
            record = wageRecordRepository.findByIdAndFarmerId(request.getWageRecordId(), farmerId).orElse(null);
        }

        WagePayment payment = new WagePayment(
                farmerId,
                employee,
                record,
                request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now(),
                request.getAmount(),
                request.getPaymentMethod(),
                request.getReferenceNumber(),
                request.getNotes()
        );

        payment = wagePaymentRepository.save(payment);
        return mapPaymentToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<WageRecordResponse> getWageRecords(Long farmerId, Long employeeId) {
        List<WageRecord> records;
        if (employeeId != null) {
            records = wageRecordRepository.findByFarmerIdAndEmployeeIdOrderByCreatedAtDesc(farmerId, employeeId);
        } else {
            records = wageRecordRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        }

        return records.stream()
                .map(this::mapRecordToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WagePaymentResponse> getWagePayments(Long farmerId, Long employeeId) {
        List<WagePayment> payments;
        if (employeeId != null) {
            payments = wagePaymentRepository.findByFarmerIdAndEmployeeIdOrderByPaymentDateDesc(farmerId, employeeId);
        } else {
            payments = wagePaymentRepository.findByFarmerIdOrderByPaymentDateDesc(farmerId);
        }

        return payments.stream()
                .map(this::mapPaymentToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkerBalanceSummary> getWorkerBalances(Long farmerId) {
        List<Employee> employees = employeeRepository.findByFarmerId(farmerId);
        List<WorkerBalanceSummary> summaries = new ArrayList<>();

        for (Employee e : employees) {
            BigDecimal agreed = wageRecordRepository.sumFinalAgreedWageByFarmerIdAndEmployeeId(farmerId, e.getId());
            BigDecimal paid = wagePaymentRepository.sumPaidByFarmerIdAndEmployeeId(farmerId, e.getId());
            BigDecimal balance = agreed.subtract(paid);

            Optional<WageRecord> latestOpt = wageRecordRepository
                    .findFirstByFarmerIdAndEmployeeIdOrderByEndDateDesc(farmerId, e.getId());

            LocalDate latestStart = latestOpt.map(WageRecord::getStartDate).orElse(null);
            LocalDate latestEnd = latestOpt.map(WageRecord::getEndDate).orElse(null);
            BigDecimal latestAmount = latestOpt.map(WageRecord::getFinalAgreedWage).orElse(null);

            List<WageRecord> allRecords = wageRecordRepository
                    .findByFarmerIdAndEmployeeIdOrderByCreatedAtDesc(farmerId, e.getId());
            long count = allRecords.size();

            summaries.add(new WorkerBalanceSummary(
                    e.getId(),
                    e.getFullName(),
                    e.getMobileNumber(),
                    agreed,
                    paid,
                    balance,
                    latestStart,
                    latestEnd,
                    latestAmount,
                    count
            ));
        }

        return summaries;
    }

    private WageRecordResponse mapRecordToResponse(WageRecord record) {
        WageRecordResponse res = new WageRecordResponse();
        res.setId(record.getId());
        res.setFarmerId(record.getFarmerId());
        res.setEmployeeId(record.getEmployee().getId());
        res.setEmployeeName(record.getEmployee().getFullName());
        res.setStartDate(record.getStartDate());
        res.setEndDate(record.getEndDate());
        res.setTotalDaysWorked(record.getTotalDaysWorked());
        res.setSuggestedWage(record.getSuggestedWage());
        res.setFinalAgreedWage(record.getFinalAgreedWage());
        res.setNotes(record.getNotes());
        res.setCreatedAt(record.getCreatedAt());

        BigDecimal totalPaid = wagePaymentRepository.sumPaidByFarmerIdAndEmployeeId(record.getFarmerId(), record.getEmployee().getId());
        res.setTotalPaid(totalPaid);
        res.setOutstandingBalance(record.getFinalAgreedWage().subtract(totalPaid));

        return res;
    }

    private WagePaymentResponse mapPaymentToResponse(WagePayment p) {
        WagePaymentResponse res = new WagePaymentResponse();
        res.setId(p.getId());
        res.setFarmerId(p.getFarmerId());
        res.setEmployeeId(p.getEmployee().getId());
        res.setEmployeeName(p.getEmployee().getFullName());
        res.setWageRecordId(p.getWageRecord() != null ? p.getWageRecord().getId() : null);
        res.setPaymentDate(p.getPaymentDate());
        res.setAmount(p.getAmount());
        res.setPaymentMethod(p.getPaymentMethod());
        res.setReferenceNumber(p.getReferenceNumber());
        res.setNotes(p.getNotes());
        res.setCreatedAt(p.getCreatedAt());
        return res;
    }
}
