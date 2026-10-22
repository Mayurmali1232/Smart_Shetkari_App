package com.smartshetkari.expense.dto;

import com.smartshetkari.expense.TractorExpense.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TractorExpenseRequest {

    private Long tractorId;

    @NotNull(message = "Expense category is required")
    private ExpenseCategory category = ExpenseCategory.DIESEL;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private LocalDate expenseDate;
    private String description;
    private String receiptUrl;

    public TractorExpenseRequest() {
    }

    public Long getTractorId() {
        return tractorId;
    }

    public void setTractorId(Long tractorId) {
        this.tractorId = tractorId;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }
}
