package com.smartshetkari.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CompleteWorkRequest {

    private Double actualHours;
    private BigDecimal actualAreaAcres;
    private String workSummary;
    private BigDecimal finalAgreedAmount;
    private LocalDate completedDate;

    public CompleteWorkRequest() {
    }

    public Double getActualHours() {
        return actualHours;
    }

    public void setActualHours(Double actualHours) {
        this.actualHours = actualHours;
    }

    public BigDecimal getActualAreaAcres() {
        return actualAreaAcres;
    }

    public void setActualAreaAcres(BigDecimal actualAreaAcres) {
        this.actualAreaAcres = actualAreaAcres;
    }

    public String getWorkSummary() {
        return workSummary;
    }

    public void setWorkSummary(String workSummary) {
        this.workSummary = workSummary;
    }

    public BigDecimal getFinalAgreedAmount() {
        return finalAgreedAmount;
    }

    public void setFinalAgreedAmount(BigDecimal finalAgreedAmount) {
        this.finalAgreedAmount = finalAgreedAmount;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }
}
