package com.smartshetkari.payment;

import com.smartshetkari.booking.TractorBooking;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tractor_payments", indexes = {
        @Index(name = "idx_tracpay_farmer", columnList = "farmerId"),
        @Index(name = "idx_tracpay_date", columnList = "paymentDate")
})
public class TractorPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private TractorBooking booking;

    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PaymentMethod {
        CASH, UPI, BANK_TRANSFER, CHEQUE
    }

    public TractorPayment() {
    }

    public TractorPayment(Long farmerId, TractorBooking booking, String customerName,
                          BigDecimal amount, LocalDate paymentDate, PaymentMethod paymentMethod, String notes) {
        this.farmerId = farmerId;
        this.booking = booking;
        this.customerName = customerName;
        this.amount = amount;
        this.paymentDate = paymentDate != null ? paymentDate : LocalDate.now();
        this.paymentMethod = paymentMethod != null ? paymentMethod : PaymentMethod.CASH;
        this.notes = notes;
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

    public TractorBooking getBooking() {
        return booking;
    }

    public void setBooking(TractorBooking booking) {
        this.booking = booking;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
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
}
