package com.smartshetkari.report;

import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.report.dto.DashboardStatsResponse;
import com.smartshetkari.report.dto.FinancialSummaryResponse;
import com.smartshetkari.security.UserPrincipal;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DashboardStatsResponse stats = reportService.getDashboardStats(principal.getId(), date);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/financial-summary")
    public ResponseEntity<ApiResponse<FinancialSummaryResponse>> getFinancialSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        FinancialSummaryResponse summary = reportService.getFinancialSummary(principal.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping(value = "/export/csv", produces = {"text/csv", "text/plain", "*/*"})
    public ResponseEntity<String> exportCsv(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String csv = reportService.generateFinancialSummaryCsv(principal.getId(), startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"smartshetkari-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }
}
