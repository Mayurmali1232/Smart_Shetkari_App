package com.smartshetkari.dairy;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "milk_productions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_animal_date", columnNames = {"animal_id", "productionDate"})
        },
        indexes = {
                @Index(name = "idx_milk_prod_farmer_date", columnList = "farmerId, productionDate"),
                @Index(name = "idx_milk_prod_animal", columnList = "animal_id, productionDate")
        }
)
public class MilkProduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private LocalDate productionDate;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal morningLiters = BigDecimal.ZERO;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal eveningLiters = BigDecimal.ZERO;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal totalLiters = BigDecimal.ZERO;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public MilkProduction() {
    }

    public MilkProduction(Long farmerId, Animal animal, LocalDate productionDate,
                          BigDecimal morningLiters, BigDecimal eveningLiters,
                          BigDecimal totalLiters, String notes) {
        this.farmerId = farmerId;
        this.animal = animal;
        this.productionDate = productionDate;
        this.morningLiters = morningLiters != null ? morningLiters : BigDecimal.ZERO;
        this.eveningLiters = eveningLiters != null ? eveningLiters : BigDecimal.ZERO;
        this.totalLiters = totalLiters != null ? totalLiters : this.morningLiters.add(this.eveningLiters);
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
