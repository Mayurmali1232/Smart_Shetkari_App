package com.smartshetkari.employee.dto;

import com.smartshetkari.employee.Employee.EmploymentStatus;
import com.smartshetkari.employee.Employee.WageType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmployeeResponse {

    private Long id;
    private Long farmerId;
    private String fullName;
    private String mobileNumber;
    private String villageAddress;
    private BigDecimal dailyWage;
    private WageType wageType;
    private LocalDate joiningDate;
    private EmploymentStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Aggregates
    private long totalDaysWorked;
    private BigDecimal totalWagesEarned;
    private BigDecimal totalPaid;
    private BigDecimal outstandingBalance;

    public EmployeeResponse() {
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getVillageAddress() {
        return villageAddress;
    }

    public void setVillageAddress(String villageAddress) {
        this.villageAddress = villageAddress;
    }

    public BigDecimal getDailyWage() {
        return dailyWage;
    }

    public void setDailyWage(BigDecimal dailyWage) {
        this.dailyWage = dailyWage;
    }

    public WageType getWageType() {
        return wageType;
    }

    public void setWageType(WageType wageType) {
        this.wageType = wageType;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public EmploymentStatus getStatus() {
        return status;
    }

    public void setStatus(EmploymentStatus status) {
        this.status = status;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public long getTotalDaysWorked() {
        return totalDaysWorked;
    }

    public void setTotalDaysWorked(long totalDaysWorked) {
        this.totalDaysWorked = totalDaysWorked;
    }

    public BigDecimal getTotalWagesEarned() {
        return totalWagesEarned;
    }

    public void setTotalWagesEarned(BigDecimal totalWagesEarned) {
        this.totalWagesEarned = totalWagesEarned;
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
}
