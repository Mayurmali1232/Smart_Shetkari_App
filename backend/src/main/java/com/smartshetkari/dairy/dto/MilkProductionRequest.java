package com.smartshetkari.dairy.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MilkProductionRequest {

    @NotNull(message = "Animal ID is required")
    private Long animalId;

    @NotNull(message = "Production date is required")
    private LocalDate productionDate;

    @NotNull(message = "Morning milk liters is required")
    @DecimalMin(value = "0.0", message = "Morning liters must be non-negative")
    private BigDecimal morningLiters = BigDecimal.ZERO;

    @NotNull(message = "Evening milk liters is required")
    @DecimalMin(value = "0.0", message = "Evening liters must be non-negative")
    private BigDecimal eveningLiters = BigDecimal.ZERO;

    // Optional manual override for total liters
    private BigDecimal totalLiters;

    private String notes;

    public MilkProductionRequest() {
    }

    public Long getAnimalId() {
        return animalId;
    }

    public void setAnimalId(Long animalId) {
        this.animalId = animalId;
    }

    public LocalDate getProductionDate() {
        return productionDate;
    }

    public void setProductionDate(LocalDate productionDate) {
        this.productionDate = productionDate;
    }

    public BigDecimal getMorningLiters() {
        return morningLiters;
    }

    public void setMorningLiters(BigDecimal morningLiters) {
        this.morningLiters = morningLiters;
    }

    public BigDecimal getEveningLiters() {
        return eveningLiters;
    }

    public void setEveningLiters(BigDecimal eveningLiters) {
        this.eveningLiters = eveningLiters;
    }

    public BigDecimal getTotalLiters() {
        return totalLiters;
    }

    public void setTotalLiters(BigDecimal totalLiters) {
        this.totalLiters = totalLiters;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
