package com.smartshetkari.tractor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tractors", indexes = {
        @Index(name = "idx_trac_farmer", columnList = "farmerId"),
        @Index(name = "idx_trac_status", columnList = "availabilityStatus")
})
public class Tractor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @Column(nullable = false, length = 100)
    private String modelName;

    @Column(length = 30)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OwnershipType ownershipType = OwnershipType.OWNED;

    @Column(length = 50)
    private String tractorType;

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultHourlyRate;

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultPerAcreRate;

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultPerDayRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum OwnershipType {
        OWNED, RENTED, LEASED
    }

    public enum AvailabilityStatus {
        AVAILABLE, BUSY, MAINTENANCE
    }

    public Tractor() {
    }

    public Tractor(Long farmerId, String modelName, String registrationNumber,
                   OwnershipType ownershipType, String tractorType,
                   BigDecimal defaultHourlyRate, BigDecimal defaultPerAcreRate, BigDecimal defaultPerDayRate,
                   AvailabilityStatus availabilityStatus, String notes) {
        this.farmerId = farmerId;
        this.modelName = modelName;
        this.registrationNumber = registrationNumber;
        this.ownershipType = ownershipType != null ? ownershipType : OwnershipType.OWNED;
        this.tractorType = tractorType;
        this.defaultHourlyRate = defaultHourlyRate;
        this.defaultPerAcreRate = defaultPerAcreRate;
        this.defaultPerDayRate = defaultPerDayRate;
        this.availabilityStatus = availabilityStatus != null ? availabilityStatus : AvailabilityStatus.AVAILABLE;
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

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public OwnershipType getOwnershipType() {
        return ownershipType;
    }

    public void setOwnershipType(OwnershipType ownershipType) {
        this.ownershipType = ownershipType;
    }

    public String getTractorType() {
        return tractorType;
    }

    public void setTractorType(String tractorType) {
        this.tractorType = tractorType;
    }

    public BigDecimal getDefaultHourlyRate() {
        return defaultHourlyRate;
    }

    public void setDefaultHourlyRate(BigDecimal defaultHourlyRate) {
        this.defaultHourlyRate = defaultHourlyRate;
    }

    public BigDecimal getDefaultPerAcreRate() {
        return defaultPerAcreRate;
    }

    public void setDefaultPerAcreRate(BigDecimal defaultPerAcreRate) {
        this.defaultPerAcreRate = defaultPerAcreRate;
    }

    public BigDecimal getDefaultPerDayRate() {
        return defaultPerDayRate;
    }

    public void setDefaultPerDayRate(BigDecimal defaultPerDayRate) {
        this.defaultPerDayRate = defaultPerDayRate;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
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
