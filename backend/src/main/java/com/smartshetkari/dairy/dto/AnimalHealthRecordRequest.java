package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.AnimalHealthRecord;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AnimalHealthRecordRequest {

    @NotNull(message = "Animal ID is required")
    private Long animalId;

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;

    @NotNull(message = "Record type is required")
    private AnimalHealthRecord.RecordType recordType = AnimalHealthRecord.RecordType.VACCINATION;

    @NotBlank(message = "Treatment or vaccination name is required")
    private String treatmentName;

    private String medicineName;
    private String doctorName;
    private BigDecimal cost;
    private LocalDate nextDueDate;
    private String notes;

    public AnimalHealthRecordRequest() {
    }

    public Long getAnimalId() {
        return animalId;
    }

    public void setAnimalId(Long animalId) {
        this.animalId = animalId;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
