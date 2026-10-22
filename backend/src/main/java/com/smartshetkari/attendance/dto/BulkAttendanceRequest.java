package com.smartshetkari.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class BulkAttendanceRequest {

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    @NotEmpty(message = "Attendance records list cannot be empty")
    @Valid
    private List<AttendanceRecordRequest> records;

    public BulkAttendanceRequest() {
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public List<AttendanceRecordRequest> getRecords() {
        return records;
    }

    public void setRecords(List<AttendanceRecordRequest> records) {
        this.records = records;
    }
}
