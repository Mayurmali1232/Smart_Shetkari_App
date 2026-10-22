package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.DairyExpense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DairyExpenseResponse {

    private Long id;
    private Long farmerId;
    private Long animalId;
    private String animalName;
    private String animalTagNumber;
    private DairyExpense.ExpenseCategory category;
    private BigDecimal amount;
    private BigDecimal quantity;
    private String unit;
    private LocalDate expenseDate;
    private boolean isCapitalExpense;
    private String description;
    private String receiptUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DairyExpenseResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public Long getAnimalId() {
        return animalId;
    }

    public void setAnimalId(Long animalId) {
        this.animalId = animalId;
    }

    public String getAnimalName() {
        return animalName;
    }

    public void setAnimalName(String animalName) {
        this.animalName = animalName;
    }

    public String getAnimalTagNumber() {
        return animalTagNumber;
    }

    public void setAnimalTagNumber(String animalTagNumber) {
        this.animalTagNumber = animalTagNumber;
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

    public boolean isCapitalExpense() {
        return isCapitalExpense;
    }

    public void setCapitalExpense(boolean capitalExpense) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
