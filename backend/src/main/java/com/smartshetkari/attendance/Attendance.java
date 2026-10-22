package com.smartshetkari.attendance;

import com.smartshetkari.employee.Employee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "attendance",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_farmer_employee_workdate", columnNames = {"farmerId", "employee_id", "workDate"})
        },
        indexes = {
                @Index(name = "idx_att_farmer_date", columnList = "farmerId, workDate"),
                @Index(name = "idx_att_employee_date", columnList = "employee_id, workDate")
        }
)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long farmerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double hoursWorked;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal dailyWageRate;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum AttendanceStatus {
        PRESENT, ABSENT, HALF_DAY, LEAVE
    }

    public Attendance() {
    }

    public Attendance(Long farmerId, Employee employee, LocalDate workDate,
                      AttendanceStatus status, BigDecimal dailyWageRate,
                      LocalTime checkInTime, LocalTime checkOutTime, Double hoursWorked, String notes) {
        this.farmerId = farmerId;
        this.employee = employee;
        this.workDate = workDate;
        this.status = status;
        this.dailyWageRate = dailyWageRate;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.hoursWorked = hoursWorked;
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

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public Double getHoursWorked() {
        return hoursWorked;
    }

    public void setHoursWorked(Double hoursWorked) {
        this.hoursWorked = hoursWorked;
    }

    public BigDecimal getDailyWageRate() {
        return dailyWageRate;
    }

    public void setDailyWageRate(BigDecimal dailyWageRate) {
        this.dailyWageRate = dailyWageRate;
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
