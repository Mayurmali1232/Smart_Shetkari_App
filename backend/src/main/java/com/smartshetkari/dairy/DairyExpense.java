package com.smartshetkari.dairy;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dairy_expenses", indexes = {
        @Index(name = "idx_dairy_expenses_farmer_date", columnList = "farmerId, expenseDate"),
        @Index(name = "idx_dairy_expenses_animal", columnList = "animal_id"),
        @Index(name = "idx_dairy_expenses_category", columnList = "farmerId, category")
})
public class DairyExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal; // null indicates shared herd expense

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ExpenseCategory category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(precision = 8, scale = 2)
    private BigDecimal quantity;

    @Column(length = 30)
    private String unit; // KG, BAG, LITER, DOSE, VISIT

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(nullable = false)
    private boolean isCapitalExpense = false;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String receiptUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ExpenseCategory {
        FEED_FODDER,
        DRY_GRASS,
        VETERINARY,
        MEDICINE_VACCINE,
        BREEDING_INSEMINATION,
        TRANSPORT,
        EQUIPMENT_MAINTENANCE,
        INSURANCE,
        PURCHASE_COST,
        OTHER
    }

    public DairyExpense() {
    }

    public DairyExpense(Long farmerId, Animal animal, ExpenseCategory category, BigDecimal amount,
                        BigDecimal quantity, String unit, LocalDate expenseDate, boolean isCapitalExpense,
                        String description, String receiptUrl) {
        this.farmerId = farmerId;
        this.animal = animal;
        this.category = category;
        this.amount = amount;
        this.quantity = quantity;
        this.unit = unit;
        this.expenseDate = expenseDate;
        this.isCapitalExpense = isCapitalExpense || category == ExpenseCategory.PURCHASE_COST;
        this.description = description;
        this.receiptUrl = receiptUrl;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public Animal getAnimal() {
        return animal;
    }

    public void setAnimal(Animal animal) {
        this.animal = animal;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
        if (category == ExpenseCategory.PURCHASE_COST) {
            this.isCapitalExpense = true;
        }
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
