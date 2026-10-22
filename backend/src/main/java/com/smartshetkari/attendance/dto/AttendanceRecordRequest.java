package com.smartshetkari.attendance.dto;

import com.smartshetkari.attendance.Attendance.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalTime;

public class AttendanceRecordRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double hoursWorked;
    private BigDecimal dailyWageRate;
    private String notes;

    public AttendanceRecordRequest() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public Double getHoursWorked() {
        return hoursWorked;
    }

    public void setHoursWorked(Double hoursWorked) {
        this.hoursWorked = hoursWorked;
    }

    public BigDecimal getDailyWageRate() {
        return dailyWageRate;
    }

    public void setDailyWageRate(BigDecimal dailyWageRate) {
        this.dailyWageRate = dailyWageRate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
