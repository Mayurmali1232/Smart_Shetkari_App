package com.smartshetkari.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FinancialSummaryResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalCompletedWorkValue;
    private BigDecimal totalTractorIncomeCollected;
    private BigDecimal outstandingCustomerReceivables;
    private BigDecimal totalWorkerWagesAgreed;
    private BigDecimal totalWorkerWagesPaid;
    private BigDecimal outstandingWorkerPayables;
    private BigDecimal totalTractorExpenses;
    private BigDecimal netProfit;

    public FinancialSummaryResponse() {
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalCompletedWorkValue() {
        return totalCompletedWorkValue;
    }

    public void setTotalCompletedWorkValue(BigDecimal totalCompletedWorkValue) {
        this.totalCompletedWorkValue = totalCompletedWorkValue;
    }

    public BigDecimal getTotalTractorIncomeCollected() {
        return totalTractorIncomeCollected;
    }

    public void setTotalTractorIncomeCollected(BigDecimal totalTractorIncomeCollected) {
        this.totalTractorIncomeCollected = totalTractorIncomeCollected;
    }

    public BigDecimal getOutstandingCustomerReceivables() {
        return outstandingCustomerReceivables;
    }

    public void setOutstandingCustomerReceivables(BigDecimal outstandingCustomerReceivables) {
        this.outstandingCustomerReceivables = outstandingCustomerReceivables;
    }

    public BigDecimal getTotalWorkerWagesAgreed() {
        return totalWorkerWagesAgreed;
    }

    public void setTotalWorkerWagesAgreed(BigDecimal totalWorkerWagesAgreed) {
        this.totalWorkerWagesAgreed = totalWorkerWagesAgreed;
    }

    public BigDecimal getTotalWorkerWagesPaid() {
        return totalWorkerWagesPaid;
    }

    public void setTotalWorkerWagesPaid(BigDecimal totalWorkerWagesPaid) {
        this.totalWorkerWagesPaid = totalWorkerWagesPaid;
    }

    public BigDecimal getOutstandingWorkerPayables() {
        return outstandingWorkerPayables;
    }

    public void setOutstandingWorkerPayables(BigDecimal outstandingWorkerPayables) {
        this.outstandingWorkerPayables = outstandingWorkerPayables;
    }

    public BigDecimal getTotalTractorExpenses() {
        return totalTractorExpenses;
    }

    public void setTotalTractorExpenses(BigDecimal totalTractorExpenses) {
        this.totalTractorExpenses = totalTractorExpenses;
    }

    public BigDecimal getNetProfit() {
        return netProfit;
    }

    public void setNetProfit(BigDecimal netProfit) {
        this.netProfit = netProfit;
    }
}
