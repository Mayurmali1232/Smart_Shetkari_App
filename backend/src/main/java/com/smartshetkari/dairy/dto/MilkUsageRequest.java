package com.smartshetkari.dairy.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MilkUsageRequest {

    @NotNull(message = "Usage date is required")
    private LocalDate usageDate;

    @DecimalMin(value = "0.0", message = "Home consumption must be non-negative")
    private BigDecimal homeConsumptionLiters = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Calf feeding must be non-negative")
    private BigDecimal calfFeedingLiters = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Wasted liters must be non-negative")
    private BigDecimal wastedLiters = BigDecimal.ZERO;

    private String notes;

    public MilkUsageRequest() {
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
