package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.Animal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AnimalResponse {

    private Long id;
    private Long farmerId;
    private String tagNumber;
    private String name;
    private Animal.AnimalType animalType;
    private String breed;
    private LocalDate dateOfBirth;
    private BigDecimal ageYears;
    private Animal.Gender gender;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private Animal.HealthStatus healthStatus;
    private Animal.MilkingStatus milkingStatus;
    private Animal.AnimalStatus status;
    private String dailyFeedRequirement;
    private String photoUrl;
    private String vaccinationSummary;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Aggregates
    private BigDecimal totalMilkProducedLiters;
    private BigDecimal totalExpensesIncurred;

    public AnimalResponse() {
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

    public String getTagNumber() {
        return tagNumber;
    }

    public void setTagNumber(String tagNumber) {
        this.tagNumber = tagNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Animal.AnimalType getAnimalType() {
        return animalType;
    }

    public void setAnimalType(Animal.AnimalType animalType) {
        this.animalType = animalType;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public BigDecimal getAgeYears() {
        return ageYears;
    }

    public void setAgeYears(BigDecimal ageYears) {
        this.ageYears = ageYears;
    }

    public Animal.Gender getGender() {
        return gender;
    }

    public void setGender(Animal.Gender gender) {
        this.gender = gender;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public BigDecimal getPurchaseCost() {
        return purchaseCost;
    }

    public void setPurchaseCost(BigDecimal purchaseCost) {
        this.purchaseCost = purchaseCost;
    }

    public Animal.HealthStatus getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(Animal.HealthStatus healthStatus) {
        this.healthStatus = healthStatus;
    }

    public Animal.MilkingStatus getMilkingStatus() {
        return milkingStatus;
    }

    public void setMilkingStatus(Animal.MilkingStatus milkingStatus) {
        this.milkingStatus = milkingStatus;
    }

    public Animal.AnimalStatus getStatus() {
        return status;
    }

    public void setStatus(Animal.AnimalStatus status) {
        this.status = status;
    }

    public String getDailyFeedRequirement() {
        return dailyFeedRequirement;
    }

    public void setDailyFeedRequirement(String dailyFeedRequirement) {
        this.dailyFeedRequirement = dailyFeedRequirement;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getVaccinationSummary() {
        return vaccinationSummary;
    }

    public void setVaccinationSummary(String vaccinationSummary) {
        this.vaccinationSummary = vaccinationSummary;
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

    public BigDecimal getTotalMilkProducedLiters() {
        return totalMilkProducedLiters;
    }

    public void setTotalMilkProducedLiters(BigDecimal totalMilkProducedLiters) {
        this.totalMilkProducedLiters = totalMilkProducedLiters;
    }

    public BigDecimal getTotalExpensesIncurred() {
        return totalExpensesIncurred;
    }

    public void setTotalExpensesIncurred(BigDecimal totalExpensesIncurred) {
        this.totalExpensesIncurred = totalExpensesIncurred;
    }
}
