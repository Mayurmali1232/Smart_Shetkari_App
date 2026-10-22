package com.smartshetkari.booking;

import com.smartshetkari.tractor.Tractor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "tractor_bookings", indexes = {
        @Index(name = "idx_book_farmer", columnList = "farmerId"),
        @Index(name = "idx_book_tractor_date", columnList = "tractor_id, workDate"),
        @Index(name = "idx_book_status", columnList = "status")
})
public class TractorBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tractor_id", nullable = false)
    private Tractor tractor;

    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(length = 20)
    private String customerMobile;

    @Column(nullable = false)
    private LocalDate workDate;

    private LocalTime startTime;
    private LocalTime endTime;

    @Column(length = 200)
    private String workLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkType workType = WorkType.PLOWING;

    @Column(length = 150)
    private String customWorkType;

    @Column(precision = 8, scale = 2)
    private BigDecimal estimatedArea;

    @Column(precision = 10, scale = 2)
    private BigDecimal agreedRate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAgreedAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum WorkType {
        PLOWING, HARVESTING, ROTAVATOR, CULTIVATOR, LEVELLING, RIDGING, SOWING, TRANSPORT, SPRAYING, THRESHING, BUNDING, OTHER
    }

    public enum BookingStatus {
        PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public TractorBooking() {
    }

    public TractorBooking(Long farmerId, Tractor tractor, String customerName, String customerMobile,
                          LocalDate workDate, LocalTime startTime, LocalTime endTime,
                          String workLocation, WorkType workType, BigDecimal estimatedArea,
                          BigDecimal agreedRate, BigDecimal finalAgreedAmount,
                          BookingStatus status, String notes) {
        this.farmerId = farmerId;
        this.tractor = tractor;
        this.customerName = customerName;
        this.customerMobile = customerMobile;
        this.workDate = workDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.workLocation = workLocation;
        this.workType = workType != null ? workType : WorkType.PLOWING;
        this.estimatedArea = estimatedArea;
        this.agreedRate = agreedRate;
        this.finalAgreedAmount = finalAgreedAmount;
        this.status = status != null ? status : BookingStatus.PENDING;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public Tractor getTractor() {
        return tractor;
    }

    public void setTractor(Tractor tractor) {
        this.tractor = tractor;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
