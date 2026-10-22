package com.smartshetkari.wage.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class WageRecordResponse {

    private Long id;
    private Long farmerId;
    private Long employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalDaysWorked;
    private BigDecimal suggestedWage;
    private BigDecimal finalAgreedWage;
    private BigDecimal totalPaid;
    private BigDecimal outstandingBalance;
    private String notes;
    private LocalDateTime createdAt;

    public WageRecordResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
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

    public Double getTotalDaysWorked() {
        return totalDaysWorked;
    }

    public void setTotalDaysWorked(Double totalDaysWorked) {
        this.totalDaysWorked = totalDaysWorked;
    }

    public BigDecimal getSuggestedWage() {
        return suggestedWage;
    }

    public void setSuggestedWage(BigDecimal suggestedWage) {
        this.suggestedWage = suggestedWage;
    }

    public BigDecimal getFinalAgreedWage() {
        return finalAgreedWage;
    }

    public void setFinalAgreedWage(BigDecimal finalAgreedWage) {
        this.finalAgreedWage = finalAgreedWage;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
