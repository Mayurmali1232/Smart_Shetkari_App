package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.AnimalHealthRecord;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AnimalHealthRecordResponse {

    private Long id;
    private Long farmerId;
    private Long animalId;
    private String animalName;
    private String animalTagNumber;
    private LocalDate recordDate;
    private AnimalHealthRecord.RecordType recordType;
    private String treatmentName;
    private String medicineName;
    private String doctorName;
    private BigDecimal cost;
    private LocalDate nextDueDate;
    private Boolean isOverdue;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AnimalHealthRecordResponse() {
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

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public AnimalHealthRecord.RecordType getRecordType() {
        return recordType;
    }

    public void setRecordType(AnimalHealthRecord.RecordType recordType) {
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

    public Boolean getIsOverdue() {
        return isOverdue;
    }

    public void setIsOverdue(Boolean overdue) {
        isOverdue = overdue;
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
