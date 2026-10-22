package com.smartshetkari.wage.dto;

import java.math.BigDecimal;

public class WorkerBalanceSummary {

    private Long employeeId;
    private String employeeName;
    private String mobileNumber;
    private BigDecimal totalAgreedWages;
    private BigDecimal totalPaid;
    private BigDecimal outstandingBalance;
    private java.time.LocalDate latestWageStartDate;
    private java.time.LocalDate latestWageEndDate;
    private BigDecimal latestWageAmount;
    private long totalWageRecordsCount;

    public WorkerBalanceSummary() {
    }

    public WorkerBalanceSummary(Long employeeId, String employeeName, String mobileNumber,
                                BigDecimal totalAgreedWages, BigDecimal totalPaid, BigDecimal outstandingBalance) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.mobileNumber = mobileNumber;
        this.totalAgreedWages = totalAgreedWages;
        this.totalPaid = totalPaid;
        this.outstandingBalance = outstandingBalance;
    }

    public WorkerBalanceSummary(Long employeeId, String employeeName, String mobileNumber,
                                BigDecimal totalAgreedWages, BigDecimal totalPaid, BigDecimal outstandingBalance,
                                java.time.LocalDate latestWageStartDate, java.time.LocalDate latestWageEndDate,
                                BigDecimal latestWageAmount, long totalWageRecordsCount) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.mobileNumber = mobileNumber;
        this.totalAgreedWages = totalAgreedWages;
        this.totalPaid = totalPaid;
        this.outstandingBalance = outstandingBalance;
        this.latestWageStartDate = latestWageStartDate;
        this.latestWageEndDate = latestWageEndDate;
        this.latestWageAmount = latestWageAmount;
        this.totalWageRecordsCount = totalWageRecordsCount;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public BigDecimal getTotalAgreedWages() {
        return totalAgreedWages;
    }

    public void setTotalAgreedWages(BigDecimal totalAgreedWages) {
        this.totalAgreedWages = totalAgreedWages;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }

    public java.time.LocalDate getLatestWageStartDate() {
        return latestWageStartDate;
    }

    public void setLatestWageStartDate(java.time.LocalDate latestWageStartDate) {
        this.latestWageStartDate = latestWageStartDate;
    }

    public java.time.LocalDate getLatestWageEndDate() {
        return latestWageEndDate;
    }

    public void setLatestWageEndDate(java.time.LocalDate latestWageEndDate) {
        this.latestWageEndDate = latestWageEndDate;
    }

    public BigDecimal getLatestWageAmount() {
        return latestWageAmount;
    }

    public void setLatestWageAmount(BigDecimal latestWageAmount) {
        this.latestWageAmount = latestWageAmount;
    }

    public long getTotalWageRecordsCount() {
        return totalWageRecordsCount;
    }

    public void setTotalWageRecordsCount(long totalWageRecordsCount) {
        this.totalWageRecordsCount = totalWageRecordsCount;
    }
}
