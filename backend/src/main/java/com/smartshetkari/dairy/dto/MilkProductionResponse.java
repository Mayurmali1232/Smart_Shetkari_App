package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.Animal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MilkProductionResponse {

    private Long id;
    private Long farmerId;
    private Long animalId;
    private String animalName;
    private String animalTagNumber;
    private Animal.AnimalType animalType;
    private LocalDate productionDate;
    private BigDecimal morningLiters;
    private BigDecimal eveningLiters;
    private BigDecimal totalLiters;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MilkProductionResponse() {
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

    public Long getAnimalId() {
        return animalId;
    }

    public void setAnimalId(Long animalId) {
        this.animalId = animalId;
    }

    public String getAnimalName() {
        return animalName;
    }

    public void setAnimalName(String animalName) {
        this.animalName = animalName;
    }

    public String getAnimalTagNumber() {
        return animalTagNumber;
    }

    public void setAnimalTagNumber(String animalTagNumber) {
        this.animalTagNumber = animalTagNumber;
    }

    public Animal.AnimalType getAnimalType() {
        return animalType;
    }

    public void setAnimalType(Animal.AnimalType animalType) {
        this.animalType = animalType;
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
