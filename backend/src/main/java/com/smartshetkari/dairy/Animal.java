package com.smartshetkari.dairy;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "animals", indexes = {
        @Index(name = "idx_animals_farmer_status", columnList = "farmerId, status"),
        @Index(name = "idx_animals_type", columnList = "farmerId, animalType"),
        @Index(name = "idx_animals_tag", columnList = "farmerId, tagNumber")
})
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @Column(length = 50)
    private String tagNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AnimalType animalType = AnimalType.COW;

    @Column(length = 100)
    private String breed;

    private LocalDate dateOfBirth;

    @Column(precision = 4, scale = 1)
    private BigDecimal ageYears;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender = Gender.FEMALE;

    private LocalDate purchaseDate;

    @Column(precision = 12, scale = 2)
    private BigDecimal purchaseCost = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HealthStatus healthStatus = HealthStatus.HEALTHY;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MilkingStatus milkingStatus = MilkingStatus.MILKING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnimalStatus status = AnimalStatus.ACTIVE;

    @Column(length = 255)
    private String dailyFeedRequirement;

    @Column(length = 500)
    private String photoUrl;

    @Column(length = 255)
    private String vaccinationSummary;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum AnimalType {
        COW, BUFFALO, GOAT, SHEEP, OTHER
    }

    public enum Gender {
        FEMALE, MALE
    }

    public enum HealthStatus {
        HEALTHY, SICK, UNDER_TREATMENT, PREGNANT
    }

    public enum MilkingStatus {
        MILKING, DRY, PREGNANT, NOT_APPLICABLE
    }

    public enum AnimalStatus {
        ACTIVE, SOLD, DECEASED, INACTIVE
    }

    public Animal() {
    }

    public Animal(Long farmerId, String tagNumber, String name, AnimalType animalType, String breed,
                  LocalDate dateOfBirth, BigDecimal ageYears, Gender gender, LocalDate purchaseDate,
                  BigDecimal purchaseCost, HealthStatus healthStatus, MilkingStatus milkingStatus,
                  AnimalStatus status, String dailyFeedRequirement, String photoUrl, String notes) {
        this.farmerId = farmerId;
        this.tagNumber = tagNumber;
        this.name = name;
        this.animalType = animalType != null ? animalType : AnimalType.COW;
        this.breed = breed;
        this.dateOfBirth = dateOfBirth;
        this.ageYears = ageYears;
        this.gender = gender != null ? gender : Gender.FEMALE;
        this.purchaseDate = purchaseDate;
        this.purchaseCost = purchaseCost != null ? purchaseCost : BigDecimal.ZERO;
        this.healthStatus = healthStatus != null ? healthStatus : HealthStatus.HEALTHY;
        this.milkingStatus = milkingStatus != null ? milkingStatus : MilkingStatus.MILKING;
        this.status = status != null ? status : AnimalStatus.ACTIVE;
        this.dailyFeedRequirement = dailyFeedRequirement;
        this.photoUrl = photoUrl;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

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

    public AnimalType getAnimalType() {
        return animalType;
    }

    public void setAnimalType(AnimalType animalType) {
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

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
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

    public HealthStatus getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(HealthStatus healthStatus) {
        this.healthStatus = healthStatus;
    }

    public MilkingStatus getMilkingStatus() {
        return milkingStatus;
    }

    public void setMilkingStatus(MilkingStatus milkingStatus) {
        this.milkingStatus = milkingStatus;
    }

    public AnimalStatus getStatus() {
        return status;
    }

    public void setStatus(AnimalStatus status) {
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
}
