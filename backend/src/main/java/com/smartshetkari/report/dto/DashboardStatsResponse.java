package com.smartshetkari.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DashboardStatsResponse {

    private LocalDate currentDate;
    private long totalActiveWorkers;
    private long workersPresentToday;
    private long workersAbsentToday;
    private BigDecimal todayWageAmount;
    private BigDecimal outstandingWorkerWages;
    private long totalTractors;
    private long todayTractorBookings;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal outstandingCustomerPayments;

    public DashboardStatsResponse() {
    }

    public LocalDate getCurrentDate() {
        return currentDate;
    }

    public void setCurrentDate(LocalDate currentDate) {
        this.currentDate = currentDate;
    }

    public long getTotalActiveWorkers() {
        return totalActiveWorkers;
    }

    public void setTotalActiveWorkers(long totalActiveWorkers) {
        this.totalActiveWorkers = totalActiveWorkers;
    }

    public long getWorkersPresentToday() {
        return workersPresentToday;
    }

    public void setWorkersPresentToday(long workersPresentToday) {
        this.workersPresentToday = workersPresentToday;
    }

    public long getWorkersAbsentToday() {
        return workersAbsentToday;
    }

    public void setWorkersAbsentToday(long workersAbsentToday) {
        this.workersAbsentToday = workersAbsentToday;
    }

    public BigDecimal getTodayWageAmount() {
        return todayWageAmount;
    }

    public void setTodayWageAmount(BigDecimal todayWageAmount) {
        this.todayWageAmount = todayWageAmount;
    }

    public BigDecimal getOutstandingWorkerWages() {
        return outstandingWorkerWages;
    }

    public void setOutstandingWorkerWages(BigDecimal outstandingWorkerWages) {
        this.outstandingWorkerWages = outstandingWorkerWages;
    }

    public long getTotalTractors() {
        return totalTractors;
    }

    public void setTotalTractors(long totalTractors) {
        this.totalTractors = totalTractors;
    }

    public long getTodayTractorBookings() {
        return todayTractorBookings;
    }

    public void setTodayTractorBookings(long todayTractorBookings) {
        this.todayTractorBookings = todayTractorBookings;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public BigDecimal getMonthlyExpenses() {
        return monthlyExpenses;
    }

    public void setMonthlyExpenses(BigDecimal monthlyExpenses) {
        this.monthlyExpenses = monthlyExpenses;
    }

    public BigDecimal getOutstandingCustomerPayments() {
        return outstandingCustomerPayments;
    }

    public void setOutstandingCustomerPayments(BigDecimal outstandingCustomerPayments) {
        this.outstandingCustomerPayments = outstandingCustomerPayments;
    }
}
