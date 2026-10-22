package com.smartshetkari.employee;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees", indexes = {
        @Index(name = "idx_emp_farmer_id", columnList = "farmerId"),
        @Index(name = "idx_emp_status", columnList = "status")
})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String mobileNumber;

    @Column(length = 255)
    private String villageAddress;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal dailyWage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WageType wageType = WageType.DAILY;

    @Column(nullable = false)
    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmploymentStatus status = EmploymentStatus.ACTIVE;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum WageType {
        DAILY, MONTHLY, PIECE_RATE
    }

    public enum EmploymentStatus {
        ACTIVE, INACTIVE
    }

    public Employee() {
    }

    public Employee(Long farmerId, String fullName, String mobileNumber, String villageAddress,
                    BigDecimal dailyWage, WageType wageType, LocalDate joiningDate,
                    EmploymentStatus status, String notes) {
        this.farmerId = farmerId;
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.villageAddress = villageAddress;
        this.dailyWage = dailyWage;
        this.wageType = wageType != null ? wageType : WageType.DAILY;
        this.joiningDate = joiningDate != null ? joiningDate : LocalDate.now();
        this.status = status != null ? status : EmploymentStatus.ACTIVE;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getVillageAddress() {
        return villageAddress;
    }

    public void setVillageAddress(String villageAddress) {
        this.villageAddress = villageAddress;
    }

    public BigDecimal getDailyWage() {
        return dailyWage;
    }

    public void setDailyWage(BigDecimal dailyWage) {
        this.dailyWage = dailyWage;
    }

    public WageType getWageType() {
        return wageType;
    }

    public void setWageType(WageType wageType) {
        this.wageType = wageType;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public EmploymentStatus getStatus() {
        return status;
    }

    public void setStatus(EmploymentStatus status) {
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
