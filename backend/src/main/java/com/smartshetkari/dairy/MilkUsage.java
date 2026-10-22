package com.smartshetkari.dairy;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "milk_usages",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_farmer_usage_date", columnNames = {"farmerId", "usageDate"})
        },
        indexes = {
                @Index(name = "idx_milk_usages_farmer_date", columnList = "farmerId, usageDate")
        }
)
public class MilkUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @Column(nullable = false)
    private LocalDate usageDate;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal homeConsumptionLiters = BigDecimal.ZERO;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal calfFeedingLiters = BigDecimal.ZERO;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal wastedLiters = BigDecimal.ZERO;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public MilkUsage() {
    }

    public MilkUsage(Long farmerId, LocalDate usageDate, BigDecimal homeConsumptionLiters,
                     BigDecimal calfFeedingLiters, BigDecimal wastedLiters, String notes) {
        this.farmerId = farmerId;
        this.usageDate = usageDate;
        this.homeConsumptionLiters = homeConsumptionLiters != null ? homeConsumptionLiters : BigDecimal.ZERO;
        this.calfFeedingLiters = calfFeedingLiters != null ? calfFeedingLiters : BigDecimal.ZERO;
        this.wastedLiters = wastedLiters != null ? wastedLiters : BigDecimal.ZERO;
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

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
    }

    public BigDecimal getHomeConsumptionLiters() {
        return homeConsumptionLiters;
    }

    public void setHomeConsumptionLiters(BigDecimal homeConsumptionLiters) {
        this.homeConsumptionLiters = homeConsumptionLiters;
    }

    public BigDecimal getCalfFeedingLiters() {
        return calfFeedingLiters;
    }

    public void setCalfFeedingLiters(BigDecimal calfFeedingLiters) {
        this.calfFeedingLiters = calfFeedingLiters;
    }

    public BigDecimal getWastedLiters() {
        return wastedLiters;
    }

    public void setWastedLiters(BigDecimal wastedLiters) {
        this.wastedLiters = wastedLiters;
    }

    public BigDecimal getTotalUsedLiters() {
        return homeConsumptionLiters.add(calfFeedingLiters).add(wastedLiters);
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
