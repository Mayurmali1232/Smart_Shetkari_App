package com.smartshetkari.wage.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class WageCalculationResponse {

    private Long employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private long presentDays;
    private long halfDays;
    private Double totalDaysWorked;
    private BigDecimal defaultDailyWage;
    private BigDecimal suggestedWage;
    private long calendarDays;
    private boolean hasAttendanceRecords;
    private BigDecimal periodEstimatedWage;
    private boolean isAlreadyCalculated;
    private Long existingWageRecordId;
    private BigDecimal existingAgreedWage;
    private LocalDate existingStartDate;
    private LocalDate existingEndDate;

    public WageCalculationResponse() {
    }

    public WageCalculationResponse(Long employeeId, String employeeName, LocalDate startDate,
                                   LocalDate endDate, long presentDays, long halfDays,
                                   Double totalDaysWorked, BigDecimal defaultDailyWage, BigDecimal suggestedWage) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.presentDays = presentDays;
        this.halfDays = halfDays;
        this.totalDaysWorked = totalDaysWorked;
        this.defaultDailyWage = defaultDailyWage;
        this.suggestedWage = suggestedWage;
    }

    public WageCalculationResponse(Long employeeId, String employeeName, LocalDate startDate,
                                   LocalDate endDate, long presentDays, long halfDays,
                                   Double totalDaysWorked, BigDecimal defaultDailyWage, BigDecimal suggestedWage,
                                   long calendarDays, boolean hasAttendanceRecords, BigDecimal periodEstimatedWage) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.presentDays = presentDays;
        this.halfDays = halfDays;
        this.totalDaysWorked = totalDaysWorked;
        this.defaultDailyWage = defaultDailyWage;
        this.suggestedWage = suggestedWage;
        this.calendarDays = calendarDays;
        this.hasAttendanceRecords = hasAttendanceRecords;
        this.periodEstimatedWage = periodEstimatedWage;
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

    public long getPresentDays() {
        return presentDays;
    }

    public void setPresentDays(long presentDays) {
        this.presentDays = presentDays;
    }

    public long getHalfDays() {
        return halfDays;
    }

    public void setHalfDays(long halfDays) {
        this.halfDays = halfDays;
    }

    public Double getTotalDaysWorked() {
        return totalDaysWorked;
    }

    public void setTotalDaysWorked(Double totalDaysWorked) {
        this.totalDaysWorked = totalDaysWorked;
    }

    public BigDecimal getDefaultDailyWage() {
        return defaultDailyWage;
    }

    public void setDefaultDailyWage(BigDecimal defaultDailyWage) {
        this.defaultDailyWage = defaultDailyWage;
    }

    public BigDecimal getSuggestedWage() {
        return suggestedWage;
    }

    public void setSuggestedWage(BigDecimal suggestedWage) {
        this.suggestedWage = suggestedWage;
    }

    public long getCalendarDays() {
        return calendarDays;
    }

    public void setCalendarDays(long calendarDays) {
        this.calendarDays = calendarDays;
    }

    public boolean isHasAttendanceRecords() {
        return hasAttendanceRecords;
    }

    public void setHasAttendanceRecords(boolean hasAttendanceRecords) {
        this.hasAttendanceRecords = hasAttendanceRecords;
    }

    public BigDecimal getPeriodEstimatedWage() {
        return periodEstimatedWage;
    }

    public void setPeriodEstimatedWage(BigDecimal periodEstimatedWage) {
        this.periodEstimatedWage = periodEstimatedWage;
    }

    public boolean isAlreadyCalculated() {
        return isAlreadyCalculated;
    }

    public void setAlreadyCalculated(boolean alreadyCalculated) {
        isAlreadyCalculated = alreadyCalculated;
    }

    public Long getExistingWageRecordId() {
        return existingWageRecordId;
    }

    public void setExistingWageRecordId(Long existingWageRecordId) {
        this.existingWageRecordId = existingWageRecordId;
    }

    public BigDecimal getExistingAgreedWage() {
        return existingAgreedWage;
    }

    public void setExistingAgreedWage(BigDecimal existingAgreedWage) {
        this.existingAgreedWage = existingAgreedWage;
    }

    public LocalDate getExistingStartDate() {
        return existingStartDate;
    }

    public void setExistingStartDate(LocalDate existingStartDate) {
        this.existingStartDate = existingStartDate;
    }

    public LocalDate getExistingEndDate() {
        return existingEndDate;
    }

    public void setExistingEndDate(LocalDate existingEndDate) {
        this.existingEndDate = existingEndDate;
    }
}
