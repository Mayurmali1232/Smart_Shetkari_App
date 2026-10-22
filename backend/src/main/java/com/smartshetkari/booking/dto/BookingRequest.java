package com.smartshetkari.booking.dto;

import com.smartshetkari.booking.TractorBooking.BookingStatus;
import com.smartshetkari.booking.TractorBooking.WorkType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingRequest {

    @NotNull(message = "Tractor ID is required")
    private Long tractorId;

    @NotBlank(message = "Customer or farmer name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String customerName;

    private String customerMobile;

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    private LocalTime startTime;
    private LocalTime endTime;
    private String workLocation;
    private WorkType workType = WorkType.PLOWING;
    private String customWorkType;
    private BigDecimal estimatedArea;
    private BigDecimal agreedRate;

    @NotNull(message = "Final agreed amount is required")
    @DecimalMin(value = "0.0", message = "Amount must be non-negative")
    private BigDecimal finalAgreedAmount;

    private BookingStatus status = BookingStatus.PENDING;
    private String notes;

    public BookingRequest() {
    }

    public Long getTractorId() {
        return tractorId;
    }

    public void setTractorId(Long tractorId) {
        this.tractorId = tractorId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerMobile() {
        return customerMobile;
    }

    public void setCustomerMobile(String customerMobile) {
        this.customerMobile = customerMobile;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getWorkLocation() {
        return workLocation;
    }

    public void setWorkLocation(String workLocation) {
        this.workLocation = workLocation;
    }

    public WorkType getWorkType() {
        return workType;
    }

    public void setWorkType(WorkType workType) {
        this.workType = workType;
    }

    public String getCustomWorkType() {
        return customWorkType;
    }

    public void setCustomWorkType(String customWorkType) {
        this.customWorkType = customWorkType;
    }

    public BigDecimal getEstimatedArea() {
        return estimatedArea;
    }

    public void setEstimatedArea(BigDecimal estimatedArea) {
        this.estimatedArea = estimatedArea;
    }

    public BigDecimal getAgreedRate() {
        return agreedRate;
    }

    public void setAgreedRate(BigDecimal agreedRate) {
        this.agreedRate = agreedRate;
    }

    public BigDecimal getFinalAgreedAmount() {
        return finalAgreedAmount;
    }

    public void setFinalAgreedAmount(BigDecimal finalAgreedAmount) {
        this.finalAgreedAmount = finalAgreedAmount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
