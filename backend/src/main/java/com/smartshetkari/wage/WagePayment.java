package com.smartshetkari.wage;

import com.smartshetkari.employee.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "wage_payments", indexes = {
        @Index(name = "idx_pay_farmer", columnList = "farmerId"),
        @Index(name = "idx_pay_emp", columnList = "employee_id"),
        @Index(name = "idx_pay_date", columnList = "paymentDate")
})
public class WagePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wage_record_id")
    private WageRecord wageRecord;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Column(length = 100)
    private String referenceNumber;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum PaymentMethod {
        CASH, UPI, BANK_TRANSFER, CHEQUE
    }

    public WagePayment() {
    }

    public WagePayment(Long farmerId, Employee employee, WageRecord wageRecord,
                       LocalDate paymentDate, BigDecimal amount, PaymentMethod paymentMethod,
                       String referenceNumber, String notes) {
        this.farmerId = farmerId;
        this.employee = employee;
        this.wageRecord = wageRecord;
        this.paymentDate = paymentDate != null ? paymentDate : LocalDate.now();
        this.amount = amount;
        this.paymentMethod = paymentMethod != null ? paymentMethod : PaymentMethod.CASH;
        this.referenceNumber = referenceNumber;
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

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public WageRecord getWageRecord() {
        return wageRecord;
    }

    public void setWageRecord(WageRecord wageRecord) {
        this.wageRecord = wageRecord;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
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
