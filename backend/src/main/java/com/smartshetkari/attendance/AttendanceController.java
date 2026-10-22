package com.smartshetkari.attendance;

import com.smartshetkari.attendance.dto.AttendanceRecordRequest;
import com.smartshetkari.attendance.dto.AttendanceResponse;
import com.smartshetkari.attendance.dto.AttendanceSummaryResponse;
import com.smartshetkari.attendance.dto.BulkAttendanceRequest;
import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceResponse>> recordSingle(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody AttendanceRecordRequest request) {
        LocalDate workDate = date != null ? date : LocalDate.now();
        AttendanceResponse response = attendanceService.recordSingleAttendance(principal.getId(), workDate, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance marked successfully", response));
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> recordBulk(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BulkAttendanceRequest request) {
        List<AttendanceResponse> response = attendanceService.recordBulkAttendance(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bulk attendance saved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getByDate(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceResponse> records = attendanceService.getAttendanceByDate(principal.getId(), date);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> getSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        AttendanceSummaryResponse summary = attendanceService.getAttendanceSummary(principal.getId(), date);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRecordRequest request) {
        AttendanceResponse response = attendanceService.updateAttendance(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Attendance updated successfully", response));
    }
}
