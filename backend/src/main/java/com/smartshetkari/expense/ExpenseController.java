package com.smartshetkari.expense;

import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.expense.dto.TractorExpenseRequest;
import com.smartshetkari.expense.dto.TractorExpenseResponse;
import com.smartshetkari.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tractor-expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TractorExpenseResponse>> recordExpense(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TractorExpenseRequest request) {
        TractorExpenseResponse expense = expenseService.recordExpense(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense recorded successfully", expense));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TractorExpenseResponse>>> listExpenses(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long tractorId,
            @RequestParam(required = false) TractorExpense.ExpenseCategory category) {
        List<TractorExpenseResponse> expenses = expenseService.listExpenses(principal.getId(), tractorId, category);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }
}
