package com.smartshetkari.dairy;

import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.dairy.dto.*;
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
@RequestMapping("/api/v1/dairy")
public class DairyController {

    private final DairyService dairyService;

    public DairyController(DairyService dairyService) {
        this.dairyService = dairyService;
    }

    // ==========================================
    // 1. ANIMAL MANAGEMENT
    // ==========================================

    @PostMapping("/animals")
    public ResponseEntity<ApiResponse<AnimalResponse>> createAnimal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AnimalRequest request) {
        AnimalResponse response = dairyService.createAnimal(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Animal registered successfully", response));
    }

    @GetMapping("/animals")
    public ResponseEntity<ApiResponse<List<AnimalResponse>>> listAnimals(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Animal.AnimalType type,
            @RequestParam(required = false) Animal.AnimalStatus status,
            @RequestParam(required = false) Animal.MilkingStatus milkingStatus) {
        List<AnimalResponse> list = dairyService.listAnimals(principal.getId(), type, status, milkingStatus);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/animals/{id}")
    public ResponseEntity<ApiResponse<AnimalResponse>> getAnimal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        AnimalResponse response = dairyService.getAnimalById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/animals/{id}")
    public ResponseEntity<ApiResponse<AnimalResponse>> updateAnimal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AnimalRequest request) {
        AnimalResponse response = dairyService.updateAnimal(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Animal updated successfully", response));
    }

    @DeleteMapping("/animals/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnimal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        dairyService.deleteAnimal(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Animal record deleted successfully", null));
    }

    // ==========================================
    // 2. MILK PRODUCTION
    // ==========================================

    @PostMapping("/milk-production")
    public ResponseEntity<ApiResponse<MilkProductionResponse>> recordMilkProduction(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MilkProductionRequest request) {
        MilkProductionResponse response = dairyService.recordMilkProduction(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Milk production recorded successfully", response));
    }

    @GetMapping("/milk-production")
    public ResponseEntity<ApiResponse<List<MilkProductionResponse>>> listMilkProductions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long animalId) {
        List<MilkProductionResponse> list = dairyService.listMilkProductions(principal.getId(), startDate, endDate, animalId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PutMapping("/milk-production/{id}")
    public ResponseEntity<ApiResponse<MilkProductionResponse>> updateMilkProduction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody MilkProductionRequest request) {
        MilkProductionResponse response = dairyService.updateMilkProduction(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Milk production record updated", response));
    }

    @DeleteMapping("/milk-production/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMilkProduction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        dairyService.deleteMilkProduction(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Milk production record deleted", null));
    }

    // ==========================================
    // 3. MILK SALES
    // ==========================================

    @PostMapping("/milk-sales")
    public ResponseEntity<ApiResponse<MilkSaleResponse>> recordMilkSale(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MilkSaleRequest request) {
        MilkSaleResponse response = dairyService.recordMilkSale(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Milk sale recorded successfully", response));
    }

    @GetMapping("/milk-sales")
    public ResponseEntity<ApiResponse<List<MilkSaleResponse>>> listMilkSales(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) MilkSale.PaymentStatus status) {
        List<MilkSaleResponse> list = dairyService.listMilkSales(principal.getId(), startDate, endDate, status);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PutMapping("/milk-sales/{id}")
    public ResponseEntity<ApiResponse<MilkSaleResponse>> updateMilkSale(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody MilkSaleRequest request) {
        MilkSaleResponse response = dairyService.updateMilkSale(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Milk sale record updated", response));
    }

    @DeleteMapping("/milk-sales/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMilkSale(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        dairyService.deleteMilkSale(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Milk sale record deleted", null));
    }

    // ==========================================
    // 4. INTERNAL MILK USAGE (Home, Calf, Spoilage)
    // ==========================================

    @PostMapping("/milk-usage")
    public ResponseEntity<ApiResponse<MilkUsageResponse>> recordMilkUsage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MilkUsageRequest request) {
        MilkUsageResponse response = dairyService.recordMilkUsage(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Milk usage saved successfully", response));
    }

    @GetMapping("/milk-usage")
    public ResponseEntity<ApiResponse<MilkUsageResponse>> getMilkUsage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        MilkUsageResponse response = dairyService.getMilkUsageByDate(principal.getId(), targetDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==========================================
    // 5. DAIRY EXPENSES
    // ==========================================

    @PostMapping("/expenses")
    public ResponseEntity<ApiResponse<DairyExpenseResponse>> recordDairyExpense(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DairyExpenseRequest request) {
        DairyExpenseResponse response = dairyService.recordDairyExpense(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dairy expense recorded successfully", response));
    }

    @GetMapping("/expenses")
    public ResponseEntity<ApiResponse<List<DairyExpenseResponse>>> listDairyExpenses(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long animalId) {
        List<DairyExpenseResponse> list = dairyService.listDairyExpenses(principal.getId(), startDate, endDate, animalId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDairyExpense(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        dairyService.deleteDairyExpense(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Expense record deleted", null));
    }

    // ==========================================
    // 6. ANIMAL HEALTH & VACCINATION
    // ==========================================

    @PostMapping("/health")
    public ResponseEntity<ApiResponse<AnimalHealthRecordResponse>> recordHealthEvent(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AnimalHealthRecordRequest request) {
        AnimalHealthRecordResponse response = dairyService.recordHealthEvent(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Health record saved successfully", response));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<List<AnimalHealthRecordResponse>>> listHealthRecords(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long animalId) {
        List<AnimalHealthRecordResponse> list = dairyService.listHealthRecords(principal.getId(), animalId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/health/reminders")
    public ResponseEntity<ApiResponse<List<AnimalHealthRecordResponse>>> getReminders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "14") int daysAhead) {
        List<AnimalHealthRecordResponse> list = dairyService.getUpcomingReminders(principal.getId(), daysAhead);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @DeleteMapping("/health/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHealthRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        dairyService.deleteHealthRecord(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Health record deleted", null));
    }

    // ==========================================
    // 7. DASHBOARD & FINANCIAL PROFIT / LOSS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DairyDashboardResponse>> getDairyDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DairyDashboardResponse response = dairyService.getDairyDashboard(principal.getId(), date);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<ApiResponse<DairyProfitLossResponse>> getProfitLossReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        DairyProfitLossResponse response = dairyService.getProfitLossReport(principal.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
