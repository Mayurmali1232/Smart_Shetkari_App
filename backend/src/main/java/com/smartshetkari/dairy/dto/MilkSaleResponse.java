package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.MilkSale;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MilkSaleResponse {

    private Long id;
    private Long farmerId;
    private LocalDate saleDate;
    private String buyerName;
    private String buyerContact;
    private BigDecimal quantityLiters;
    private BigDecimal pricePerLiter;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceDue;
    private MilkSale.PaymentStatus paymentStatus;
    private MilkSale.PaymentMethod paymentMethod;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MilkSaleResponse() {
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

    public BigDecimal getBalanceDue() {
        return balanceDue;
    }

    public void setBalanceDue(BigDecimal balanceDue) {
        this.balanceDue = balanceDue;
    }

    public MilkSale.PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(MilkSale.PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public MilkSale.PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(MilkSale.PaymentMethod paymentMethod) {
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
