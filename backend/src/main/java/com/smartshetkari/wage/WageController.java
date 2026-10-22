package com.smartshetkari.wage;

import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.security.UserPrincipal;
import com.smartshetkari.wage.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wages")
public class WageController {

    private final WageService wageService;

    public WageController(WageService wageService) {
        this.wageService = wageService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<WageCalculationResponse>> calculateSuggested(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WageCalculationRequest request) {
        WageCalculationResponse calculation = wageService.calculateSuggestedWage(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(calculation));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WageRecordResponse>> createWageRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateWageRecordRequest request) {
        WageRecordResponse record = wageService.createWageRecord(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Wage record created successfully", record));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WageRecordResponse>>> getWageRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long employeeId) {
        List<WageRecordResponse> records = wageService.getWageRecords(principal.getId(), employeeId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWageRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        wageService.deleteWageRecord(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Wage record deleted successfully", null));
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<WagePaymentResponse>> recordPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WagePaymentRequest request) {
        WagePaymentResponse payment = wageService.recordPayment(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Worker payment recorded successfully", payment));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<WagePaymentResponse>>> getPayments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long employeeId) {
        List<WagePaymentResponse> payments = wageService.getWagePayments(principal.getId(), employeeId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @GetMapping("/balances")
    public ResponseEntity<ApiResponse<List<WorkerBalanceSummary>>> getBalances(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<WorkerBalanceSummary> balances = wageService.getWorkerBalances(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(balances));
    }
}
