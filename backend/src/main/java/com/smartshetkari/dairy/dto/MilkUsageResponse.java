package com.smartshetkari.dairy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MilkUsageResponse {

    private Long id;
    private Long farmerId;
    private LocalDate usageDate;
    private BigDecimal homeConsumptionLiters;
    private BigDecimal calfFeedingLiters;
    private BigDecimal wastedLiters;
    private BigDecimal totalUsedLiters;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MilkUsageResponse() {
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
        return totalUsedLiters;
    }

    public void setTotalUsedLiters(BigDecimal totalUsedLiters) {
        this.totalUsedLiters = totalUsedLiters;
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
