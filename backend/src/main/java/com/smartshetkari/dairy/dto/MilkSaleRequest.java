package com.smartshetkari.dairy.dto;

import com.smartshetkari.dairy.MilkSale;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MilkSaleRequest {

    @NotNull(message = "Sale date is required")
    private LocalDate saleDate;

    @NotBlank(message = "Buyer or dairy name is required")
    private String buyerName;

    private String buyerContact;

    @NotNull(message = "Milk quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
    private BigDecimal quantityLiters;

    @NotNull(message = "Price per liter is required")
    @DecimalMin(value = "0.01", message = "Price per liter must be greater than zero")
    private BigDecimal pricePerLiter;

    // Optional manual override for total amount
    private BigDecimal totalAmount;

    private BigDecimal paidAmount;
    private MilkSale.PaymentStatus paymentStatus = MilkSale.PaymentStatus.UNPAID;
    private MilkSale.PaymentMethod paymentMethod = MilkSale.PaymentMethod.CASH;
    private String notes;

    public MilkSaleRequest() {
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
}
