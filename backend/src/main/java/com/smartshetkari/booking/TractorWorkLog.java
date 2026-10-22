package com.smartshetkari.booking;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tractor_work_logs")
public class TractorWorkLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private TractorBooking booking;

    @Column(nullable = false)
    private Long farmerId;

    private Double actualHours;

    @Column(precision = 8, scale = 2)
    private BigDecimal actualAreaAcres;

    @Column(length = 500)
    private String workSummary;

    @Column(nullable = false)
    private LocalDate completedDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TractorWorkLog() {
    }

    public TractorWorkLog(TractorBooking booking, Long farmerId, Double actualHours,
                          BigDecimal actualAreaAcres, String workSummary, LocalDate completedDate) {
        this.booking = booking;
        this.farmerId = farmerId;
        this.actualHours = actualHours;
        this.actualAreaAcres = actualAreaAcres;
        this.workSummary = workSummary;
        this.completedDate = completedDate != null ? completedDate : LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TractorBooking getBooking() {
        return booking;
    }

    public void setBooking(TractorBooking booking) {
        this.booking = booking;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
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

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
