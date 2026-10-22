package com.smartshetkari.tractor.dto;

import com.smartshetkari.tractor.Tractor.AvailabilityStatus;
import com.smartshetkari.tractor.Tractor.OwnershipType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class TractorRequest {

    @NotBlank(message = "Tractor model name is required")
    @Size(min = 2, max = 100, message = "Model name must be between 2 and 100 characters")
    private String modelName;

    private String registrationNumber;
    private OwnershipType ownershipType = OwnershipType.OWNED;
    private String tractorType;
    private BigDecimal defaultHourlyRate;
    private BigDecimal defaultPerAcreRate;
    private BigDecimal defaultPerDayRate;
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;
    private String notes;

    public TractorRequest() {
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
}
