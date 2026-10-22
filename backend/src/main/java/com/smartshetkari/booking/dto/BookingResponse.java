package com.smartshetkari.booking.dto;

import com.smartshetkari.booking.TractorBooking.BookingStatus;
import com.smartshetkari.booking.TractorBooking.WorkType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingResponse {

    private Long id;
    private Long farmerId;
    private Long tractorId;
    private String tractorModel;
    private String registrationNumber;
    private String customerName;
    private String customerMobile;
    private LocalDate workDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String workLocation;
    private WorkType workType;
    private String customWorkType;
    private BigDecimal estimatedArea;
    private BigDecimal agreedRate;
    private BigDecimal finalAgreedAmount;
    private BookingStatus status;
    private String notes;
    private LocalDateTime createdAt;

    // Actual completed work log
    private Double actualHours;
    private BigDecimal actualAreaAcres;
    private String workSummary;
    private LocalDate completedDate;

    // Financial breakdown
    private BigDecimal totalReceived;
    private BigDecimal outstandingBalance;

    public BookingResponse() {
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

    public Long getTractorId() {
        return tractorId;
    }

    public void setTractorId(Long tractorId) {
        this.tractorId = tractorId;
    }

    public String getTractorModel() {
        return tractorModel;
    }

    public void setTractorModel(String tractorModel) {
        this.tractorModel = tractorModel;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getActualHours() {
        return actualHours;
    }

    public void setActualHours(Double actualHours) {
        this.actualHours = actualHours;
    }

    public BigDecimal getActualAreaAcres() {
        return actualAreaAcres;
    }

    public void setActualAreaAcres(BigDecimal actualAreaAcres) {
        this.actualAreaAcres = actualAreaAcres;
    }

    public String getWorkSummary() {
        return workSummary;
    }

    public void setWorkSummary(String workSummary) {
        this.workSummary = workSummary;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public BigDecimal getTotalReceived() {
        return totalReceived;
    }

    public void setTotalReceived(BigDecimal totalReceived) {
        this.totalReceived = totalReceived;
    }

    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }
}
