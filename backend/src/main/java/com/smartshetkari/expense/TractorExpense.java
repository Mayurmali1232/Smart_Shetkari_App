package com.smartshetkari.expense;

import com.smartshetkari.tractor.Tractor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tractor_expenses", indexes = {
        @Index(name = "idx_tracexp_farmer", columnList = "farmerId"),
        @Index(name = "idx_tracexp_date", columnList = "expenseDate"),
        @Index(name = "idx_tracexp_category", columnList = "category")
})
public class TractorExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tractor_id")
    private Tractor tractor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExpenseCategory category = ExpenseCategory.DIESEL;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(length = 500)
    private String description;

    @Column(length = 255)
    private String receiptUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ExpenseCategory {
        DIESEL, REPAIRS, MAINTENANCE, DRIVER_WAGE, INSURANCE, SEEDS_FERTILIZER, OTHER
    }

    public TractorExpense() {
    }

    public TractorExpense(Long farmerId, Tractor tractor, ExpenseCategory category,
                          BigDecimal amount, LocalDate expenseDate, String description, String receiptUrl) {
        this.farmerId = farmerId;
        this.tractor = tractor;
        this.category = category != null ? category : ExpenseCategory.DIESEL;
        this.amount = amount;
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
        this.description = description;
        this.receiptUrl = receiptUrl;
        this.createdAt = LocalDateTime.now();
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

    public Tractor getTractor() {
        return tractor;
    }

    public void setTractor(Tractor tractor) {
        this.tractor = tractor;
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
