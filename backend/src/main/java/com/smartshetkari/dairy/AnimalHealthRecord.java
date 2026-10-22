package com.smartshetkari.dairy;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "animal_health_records", indexes = {
        @Index(name = "idx_health_records_animal", columnList = "animal_id, recordDate"),
        @Index(name = "idx_health_records_next_due", columnList = "farmerId, nextDueDate")
})
public class AnimalHealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private LocalDate recordDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecordType recordType = RecordType.VACCINATION;

    @Column(nullable = false, length = 150)
    private String treatmentName;

    @Column(length = 150)
    private String medicineName;

    @Column(length = 100)
    private String doctorName;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost = BigDecimal.ZERO;

    private LocalDate nextDueDate;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum RecordType {
        VACCINATION, DEWORMING, TREATMENT, CHECKUP, ARTIFICIAL_INSEMINATION
    }

    public AnimalHealthRecord() {
    }

    public AnimalHealthRecord(Long farmerId, Animal animal, LocalDate recordDate, RecordType recordType,
                              String treatmentName, String medicineName, String doctorName,
                              BigDecimal cost, LocalDate nextDueDate, String notes) {
        this.farmerId = farmerId;
        this.animal = animal;
        this.recordDate = recordDate;
        this.recordType = recordType != null ? recordType : RecordType.VACCINATION;
        this.treatmentName = treatmentName;
        this.medicineName = medicineName;
        this.doctorName = doctorName;
        this.cost = cost != null ? cost : BigDecimal.ZERO;
        this.nextDueDate = nextDueDate;
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

    public Animal getAnimal() {
        return animal;
    }

    public void setAnimal(Animal animal) {
        this.animal = animal;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public RecordType getRecordType() {
        return recordType;
    }

    public void setRecordType(RecordType recordType) {
        this.recordType = recordType;
    }

    public String getTreatmentName() {
        return treatmentName;
    }

    public void setTreatmentName(String treatmentName) {
        this.treatmentName = treatmentName;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
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
