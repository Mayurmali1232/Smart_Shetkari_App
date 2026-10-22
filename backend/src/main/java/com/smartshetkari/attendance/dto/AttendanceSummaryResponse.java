package com.smartshetkari.attendance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AttendanceSummaryResponse {

    private LocalDate date;
    private long totalWorkers;
    private long presentCount;
    private long absentCount;
    private long halfDayCount;
    private long leaveCount;
    private BigDecimal estimatedWagesToday;

    public AttendanceSummaryResponse() {
    }

    public AttendanceSummaryResponse(LocalDate date, long totalWorkers, long presentCount,
                                     long absentCount, long halfDayCount, long leaveCount,
                                     BigDecimal estimatedWagesToday) {
        this.date = date;
        this.totalWorkers = totalWorkers;
        this.presentCount = presentCount;
        this.absentCount = absentCount;
        this.halfDayCount = halfDayCount;
        this.leaveCount = leaveCount;
        this.estimatedWagesToday = estimatedWagesToday;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getTotalWorkers() {
        return totalWorkers;
    }

    public void setTotalWorkers(long totalWorkers) {
        this.totalWorkers = totalWorkers;
    }

    public long getPresentCount() {
        return presentCount;
    }

    public void setPresentCount(long presentCount) {
        this.presentCount = presentCount;
    }

    public long getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(long absentCount) {
        this.absentCount = absentCount;
    }

    public long getHalfDayCount() {
        return halfDayCount;
    }

    public void setHalfDayCount(long halfDayCount) {
        this.halfDayCount = halfDayCount;
    }

    public long getLeaveCount() {
        return leaveCount;
    }

    public void setLeaveCount(long leaveCount) {
        this.leaveCount = leaveCount;
    }

    public BigDecimal getEstimatedWagesToday() {
        return estimatedWagesToday;
    }

    public void setEstimatedWagesToday(BigDecimal estimatedWagesToday) {
        this.estimatedWagesToday = estimatedWagesToday;
    }
}
