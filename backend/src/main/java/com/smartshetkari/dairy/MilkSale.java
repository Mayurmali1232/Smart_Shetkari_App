package com.smartshetkari.dairy;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "milk_sales", indexes = {
        @Index(name = "idx_milk_sales_farmer_date", columnList = "farmerId, saleDate"),
        @Index(name = "idx_milk_sales_payment_status", columnList = "farmerId, paymentStatus")
})
public class MilkSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @Column(nullable = false)
    private LocalDate saleDate;

    @Column(nullable = false, length = 120)
    private String buyerName;

    @Column(length = 20)
    private String buyerContact;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal quantityLiters;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal pricePerLiter;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum PaymentStatus {
        PAID, PARTIALLY_PAID, UNPAID
    }

    public enum PaymentMethod {
        CASH, UPI, BANK_TRANSFER, CHEQUE
    }

    public MilkSale() {
    }

    public MilkSale(Long farmerId, LocalDate saleDate, String buyerName, String buyerContact,
                    BigDecimal quantityLiters, BigDecimal pricePerLiter, BigDecimal totalAmount,
                    BigDecimal paidAmount, PaymentStatus paymentStatus, PaymentMethod paymentMethod,
                    String notes) {
        this.farmerId = farmerId;
        this.saleDate = saleDate;
        this.buyerName = buyerName;
        this.buyerContact = buyerContact;
        this.quantityLiters = quantityLiters;
        this.pricePerLiter = pricePerLiter;
        this.totalAmount = totalAmount != null ? totalAmount : quantityLiters.multiply(pricePerLiter);
        this.paidAmount = paidAmount != null ? paidAmount : BigDecimal.ZERO;
        this.paymentStatus = paymentStatus != null ? paymentStatus : PaymentStatus.UNPAID;
        this.paymentMethod = paymentMethod != null ? paymentMethod : PaymentMethod.CASH;
        this.notes = notes;
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

    public LocalDate getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDate saleDate) {
        this.saleDate = saleDate;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerContact() {
        return buyerContact;
    }

    public void setBuyerContact(String buyerContact) {
        this.buyerContact = buyerContact;
    }

    public BigDecimal getQuantityLiters() {
        return quantityLiters;
    }

    public void setQuantityLiters(BigDecimal quantityLiters) {
        this.quantityLiters = quantityLiters;
    }

    public BigDecimal getPricePerLiter() {
        return pricePerLiter;
    }

    public void setPricePerLiter(BigDecimal pricePerLiter) {
        this.pricePerLiter = pricePerLiter;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
