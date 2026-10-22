package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.Animal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AnimalRequest {

    private String tagNumber;

    @NotBlank(message = "Animal name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Animal type is required")
    private Animal.AnimalType animalType = Animal.AnimalType.COW;

    private String breed;
    private LocalDate dateOfBirth;
    private BigDecimal ageYears;
    private Animal.Gender gender = Animal.Gender.FEMALE;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private Animal.HealthStatus healthStatus = Animal.HealthStatus.HEALTHY;
    private Animal.MilkingStatus milkingStatus = Animal.MilkingStatus.MILKING;
    private Animal.AnimalStatus status = Animal.AnimalStatus.ACTIVE;
    private String dailyFeedRequirement;
    private String photoUrl;
    private String vaccinationSummary;
    private String notes;

    public AnimalRequest() {
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
}
