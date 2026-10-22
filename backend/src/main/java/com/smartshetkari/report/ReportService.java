package com.smartshetkari.report;

import com.smartshetkari.attendance.Attendance;
import com.smartshetkari.attendance.AttendanceRepository;
import com.smartshetkari.booking.BookingRepository;
import com.smartshetkari.employee.Employee;
import com.smartshetkari.employee.EmployeeRepository;
import com.smartshetkari.expense.TractorExpenseRepository;
import com.smartshetkari.payment.TractorPaymentRepository;
import com.smartshetkari.report.dto.DashboardStatsResponse;
import com.smartshetkari.report.dto.FinancialSummaryResponse;
import com.smartshetkari.tractor.TractorRepository;
import com.smartshetkari.wage.WagePaymentRepository;
import com.smartshetkari.wage.WageRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final WageRecordRepository wageRecordRepository;
    private final WagePaymentRepository wagePaymentRepository;
    private final TractorRepository tractorRepository;
    private final BookingRepository bookingRepository;
    private final TractorPaymentRepository tractorPaymentRepository;
    private final TractorExpenseRepository tractorExpenseRepository;

    public ReportService(EmployeeRepository employeeRepository,
                         AttendanceRepository attendanceRepository,
                         WageRecordRepository wageRecordRepository,
                         WagePaymentRepository wagePaymentRepository,
                         TractorRepository tractorRepository,
                         BookingRepository bookingRepository,
                         TractorPaymentRepository tractorPaymentRepository,
                         TractorExpenseRepository tractorExpenseRepository) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.wageRecordRepository = wageRecordRepository;
        this.wagePaymentRepository = wagePaymentRepository;
        this.tractorRepository = tractorRepository;
        this.bookingRepository = bookingRepository;
        this.tractorPaymentRepository = tractorPaymentRepository;
        this.tractorExpenseRepository = tractorExpenseRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long farmerId, LocalDate date) {
        LocalDate currentDate = date != null ? date : LocalDate.now();

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setCurrentDate(currentDate);

        // Workers
        stats.setTotalActiveWorkers(employeeRepository.countByFarmerIdAndStatus(farmerId, Employee.EmploymentStatus.ACTIVE));
        stats.setWorkersPresentToday(attendanceRepository.countByFarmerIdAndWorkDateAndStatus(farmerId, currentDate, Attendance.AttendanceStatus.PRESENT));
        stats.setWorkersAbsentToday(attendanceRepository.countByFarmerIdAndWorkDateAndStatus(farmerId, currentDate, Attendance.AttendanceStatus.ABSENT));

        // Today's wages calculation
        List<Attendance> todayRecords = attendanceRepository.findByFarmerIdAndWorkDate(farmerId, currentDate);
        BigDecimal todayWages = BigDecimal.ZERO;
        for (Attendance a : todayRecords) {
            if (a.getStatus() == Attendance.AttendanceStatus.PRESENT) {
                todayWages = todayWages.add(a.getDailyWageRate());
            } else if (a.getStatus() == Attendance.AttendanceStatus.HALF_DAY) {
                todayWages = todayWages.add(a.getDailyWageRate().multiply(new BigDecimal("0.5")));
            }
        }
        stats.setTodayWageAmount(todayWages);

        // Outstanding worker wages
        BigDecimal totalAgreedWages = wageRecordRepository.sumTotalWagesByFarmerId(farmerId);
        BigDecimal totalPaidWages = wagePaymentRepository.sumTotalPaidByFarmerId(farmerId);
        stats.setOutstandingWorkerWages(totalAgreedWages.subtract(totalPaidWages));

        // Tractors
        stats.setTotalTractors(tractorRepository.countByFarmerId(farmerId));
        stats.setTodayTractorBookings(bookingRepository.countByFarmerIdAndWorkDate(farmerId, currentDate));

        // Monthly figures
        LocalDate monthStart = currentDate.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate monthEnd = currentDate.with(TemporalAdjusters.lastDayOfMonth());

        BigDecimal monthlyInc = tractorPaymentRepository.sumIncomeByFarmerIdAndDateRange(farmerId, monthStart, monthEnd);
        BigDecimal monthlyExp = tractorExpenseRepository.sumExpensesByFarmerIdAndDateRange(farmerId, monthStart, monthEnd);
        stats.setMonthlyIncome(monthlyInc);
        stats.setMonthlyExpenses(monthlyExp);

        // Outstanding customer payments (Total value of completed jobs - Total payments received)
        BigDecimal totalCompletedWork = bookingRepository.sumCompletedBookingsValueByFarmerId(farmerId);
        BigDecimal totalTractorIncomeCollected = tractorPaymentRepository.sumTotalIncomeByFarmerId(farmerId);
        stats.setOutstandingCustomerPayments(totalCompletedWork.subtract(totalTractorIncomeCollected));

        return stats;
    }

    @Transactional(readOnly = true)
    public FinancialSummaryResponse getFinancialSummary(Long farmerId, LocalDate start, LocalDate end) {
        LocalDate startDate = start != null ? start : LocalDate.now().with(TemporalAdjusters.firstDayOfYear());
        LocalDate endDate = end != null ? end : LocalDate.now();

        FinancialSummaryResponse summary = new FinancialSummaryResponse();
        summary.setStartDate(startDate);
        summary.setEndDate(endDate);

        // Completed work value in range
        BigDecimal completedValue = bookingRepository.sumCompletedBookingsValueByFarmerIdAndDateRange(farmerId, startDate, endDate);
        summary.setTotalCompletedWorkValue(completedValue);

        // Cash collected for tractor in range
        BigDecimal incomeCollected = tractorPaymentRepository.sumIncomeByFarmerIdAndDateRange(farmerId, startDate, endDate);
        summary.setTotalTractorIncomeCollected(incomeCollected);
        summary.setOutstandingCustomerReceivables(completedValue.subtract(incomeCollected));

        // Wages in range
        BigDecimal totalAgreedWages = wageRecordRepository.sumTotalWagesByFarmerId(farmerId);
        BigDecimal totalWagesPaid = wagePaymentRepository.sumTotalPaidByFarmerId(farmerId);
        summary.setTotalWorkerWagesAgreed(totalAgreedWages);
        summary.setTotalWorkerWagesPaid(totalWagesPaid);
        summary.setOutstandingWorkerPayables(totalAgreedWages.subtract(totalWagesPaid));

        // Expenses in range
        BigDecimal expenses = tractorExpenseRepository.sumExpensesByFarmerIdAndDateRange(farmerId, startDate, endDate);
        summary.setTotalTractorExpenses(expenses);

        // Net Profit = Income collected - Expenses - Worker wages paid
        BigDecimal netProfit = incomeCollected.subtract(expenses).subtract(totalWagesPaid);
        summary.setNetProfit(netProfit);

        return summary;
    }

    public String generateFinancialSummaryCsv(Long farmerId, LocalDate start, LocalDate end) {
        FinancialSummaryResponse summary = getFinancialSummary(farmerId, start, end);
        StringBuilder sb = new StringBuilder();
        sb.append("Smart Shetkari - Financial Summary Report\n");
        sb.append("Period,").append(summary.getStartDate()).append(" to ").append(summary.getEndDate()).append("\n\n");
        sb.append("Metric,Amount (INR)\n");
        sb.append("Total Completed Tractor Work Value,").append(summary.getTotalCompletedWorkValue()).append("\n");
        sb.append("Actual Tractor Income Collected,").append(summary.getTotalTractorIncomeCollected()).append("\n");
        sb.append("Outstanding Customer Receivables,").append(summary.getOutstandingCustomerReceivables()).append("\n");
        sb.append("Total Farm Worker Wages Agreed,").append(summary.getTotalWorkerWagesAgreed()).append("\n");
        sb.append("Total Farm Worker Wages Paid,").append(summary.getTotalWorkerWagesPaid()).append("\n");
        sb.append("Outstanding Worker Wages Payable,").append(summary.getOutstandingWorkerPayables()).append("\n");
        sb.append("Total Operational Expenses,").append(summary.getTotalTractorExpenses()).append("\n");
        sb.append("Net Realized Cash Profit,").append(summary.getNetProfit()).append("\n");
        return sb.toString();
    }
}
