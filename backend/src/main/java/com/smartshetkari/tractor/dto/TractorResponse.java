package com.smartshetkari.tractor.dto;

import com.smartshetkari.tractor.Tractor.AvailabilityStatus;
import com.smartshetkari.tractor.Tractor.OwnershipType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TractorResponse {

    private Long id;
    private Long farmerId;
    private String modelName;
    private String registrationNumber;
    private OwnershipType ownershipType;
    private String tractorType;
    private BigDecimal defaultHourlyRate;
    private BigDecimal defaultPerAcreRate;
    private BigDecimal defaultPerDayRate;
    private AvailabilityStatus availabilityStatus;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TractorResponse() {
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
