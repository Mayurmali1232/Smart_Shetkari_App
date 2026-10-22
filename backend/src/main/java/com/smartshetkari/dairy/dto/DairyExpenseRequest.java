package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.DairyExpense;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DairyExpenseRequest {

    // Nullable for shared herd expense
    private Long animalId;

    @NotNull(message = "Expense category is required")
    private DairyExpense.ExpenseCategory category;

    @NotNull(message = "Expense amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private BigDecimal quantity;
    private String unit;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private Boolean isCapitalExpense;
    private String description;
    private String receiptUrl;

    public DairyExpenseRequest() {
    }

    public Long getAnimalId() {
        return animalId;
    }

    public void setAnimalId(Long animalId) {
        this.animalId = animalId;
    }

    public DairyExpense.ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(DairyExpense.ExpenseCategory category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public Boolean getIsCapitalExpense() {
        return isCapitalExpense;
    }

    public void setIsCapitalExpense(Boolean capitalExpense) {
        isCapitalExpense = capitalExpense;
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
