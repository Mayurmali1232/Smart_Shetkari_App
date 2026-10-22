package com.smartshetkari.wage;

import com.smartshetkari.employee.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "wage_records", indexes = {
        @Index(name = "idx_wage_farmer", columnList = "farmerId"),
        @Index(name = "idx_wage_emp", columnList = "employee_id")
})
public class WageRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Double totalDaysWorked;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal suggestedWage;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAgreedWage;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public WageRecord() {
    }

    public WageRecord(Long farmerId, Employee employee, LocalDate startDate, LocalDate endDate,
                      Double totalDaysWorked, BigDecimal suggestedWage, BigDecimal finalAgreedWage, String notes) {
        this.farmerId = farmerId;
        this.employee = employee;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalDaysWorked = totalDaysWorked;
        this.suggestedWage = suggestedWage;
        this.finalAgreedWage = finalAgreedWage != null ? finalAgreedWage : suggestedWage;
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

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Double getTotalDaysWorked() {
        return totalDaysWorked;
    }

    public void setTotalDaysWorked(Double totalDaysWorked) {
        this.totalDaysWorked = totalDaysWorked;
    }

    public BigDecimal getSuggestedWage() {
        return suggestedWage;
    }

    public void setSuggestedWage(BigDecimal suggestedWage) {
        this.suggestedWage = suggestedWage;
    }

    public BigDecimal getFinalAgreedWage() {
        return finalAgreedWage;
    }

    public void setFinalAgreedWage(BigDecimal finalAgreedWage) {
        this.finalAgreedWage = finalAgreedWage;
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
