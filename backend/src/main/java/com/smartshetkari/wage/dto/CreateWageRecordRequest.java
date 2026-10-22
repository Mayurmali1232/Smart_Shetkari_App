package com.smartshetkari.wage.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateWageRecordRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Suggested wage is required")
    private BigDecimal suggestedWage;

    @NotNull(message = "Final agreed wage is required")
    @DecimalMin(value = "0.0", message = "Agreed wage must be non-negative")
    private BigDecimal finalAgreedWage;

    private String notes;

    private Boolean autoRecordAttendance;

    public CreateWageRecordRequest() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getAutoRecordAttendance() {
        return autoRecordAttendance;
    }

    public void setAutoRecordAttendance(Boolean autoRecordAttendance) {
        this.autoRecordAttendance = autoRecordAttendance;
    }
}
