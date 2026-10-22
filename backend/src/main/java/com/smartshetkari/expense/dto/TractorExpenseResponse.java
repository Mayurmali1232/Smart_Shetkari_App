package com.smartshetkari.expense.dto;

import com.smartshetkari.expense.TractorExpense.ExpenseCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TractorExpenseResponse {

    private Long id;
    private Long farmerId;
    private Long tractorId;
    private String tractorModel;
    private ExpenseCategory category;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String description;
    private String receiptUrl;
    private LocalDateTime createdAt;

    public TractorExpenseResponse() {
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

    public Long getTractorId() {
        return tractorId;
    }

    public void setTractorId(Long tractorId) {
        this.tractorId = tractorId;
    }

    public String getTractorModel() {
        return tractorModel;
    }

    public void setTractorModel(String tractorModel) {
        this.tractorModel = tractorModel;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
