package com.smartshetkari.dairy.dto;

import java.math.BigDecimal;
import java.util.List;

public class DairyDashboardResponse {

    private long totalAnimals;
    private long totalCows;
    private long totalBuffaloes;
    private long totalMilkingAnimals;

    private BigDecimal todayMilkProductionLiters;
    private BigDecimal todayMilkSoldLiters;
    private BigDecimal todayMilkUsedLiters;
    private BigDecimal todayMilkSalesIncome;
    private BigDecimal todayExpenses;
    private BigDecimal todayEstimatedProfit;

    private BigDecimal monthlyMilkProductionLiters;
    private BigDecimal monthlySalesIncome;
    private BigDecimal monthlyOperatingExpenses;
    private BigDecimal monthlyEstimatedOperatingProfit;

    private BigDecimal outstandingMilkPayments;
    private long upcomingHealthRemindersCount;

    private List<MilkProductionResponse> recentProductions;
    private List<AnimalHealthRecordResponse> upcomingReminders;

    public DairyDashboardResponse() {
    }

    public long getTotalAnimals() {
        return totalAnimals;
    }

    public void setTotalAnimals(long totalAnimals) {
        this.totalAnimals = totalAnimals;
    }

    public long getTotalCows() {
        return totalCows;
    }

    public void setTotalCows(long totalCows) {
        this.totalCows = totalCows;
    }

    public long getTotalBuffaloes() {
        return totalBuffaloes;
    }

    public void setTotalBuffaloes(long totalBuffaloes) {
        this.totalBuffaloes = totalBuffaloes;
    }

    public long getTotalMilkingAnimals() {
        return totalMilkingAnimals;
    }

    public void setTotalMilkingAnimals(long totalMilkingAnimals) {
        this.totalMilkingAnimals = totalMilkingAnimals;
    }

    public BigDecimal getTodayMilkProductionLiters() {
        return todayMilkProductionLiters;
    }

    public void setTodayMilkProductionLiters(BigDecimal todayMilkProductionLiters) {
        this.todayMilkProductionLiters = todayMilkProductionLiters;
    }

    public BigDecimal getTodayMilkSoldLiters() {
        return todayMilkSoldLiters;
    }

    public void setTodayMilkSoldLiters(BigDecimal todayMilkSoldLiters) {
        this.todayMilkSoldLiters = todayMilkSoldLiters;
    }

    public BigDecimal getTodayMilkUsedLiters() {
        return todayMilkUsedLiters;
    }

    public void setTodayMilkUsedLiters(BigDecimal todayMilkUsedLiters) {
        this.todayMilkUsedLiters = todayMilkUsedLiters;
    }

    public BigDecimal getTodayMilkSalesIncome() {
        return todayMilkSalesIncome;
    }

    public void setTodayMilkSalesIncome(BigDecimal todayMilkSalesIncome) {
        this.todayMilkSalesIncome = todayMilkSalesIncome;
    }

    public BigDecimal getTodayExpenses() {
        return todayExpenses;
    }

    public void setTodayExpenses(BigDecimal todayExpenses) {
        this.todayExpenses = todayExpenses;
    }

    public BigDecimal getTodayEstimatedProfit() {
        return todayEstimatedProfit;
    }

    public void setTodayEstimatedProfit(BigDecimal todayEstimatedProfit) {
        this.todayEstimatedProfit = todayEstimatedProfit;
    }

    public BigDecimal getMonthlyMilkProductionLiters() {
        return monthlyMilkProductionLiters;
    }

    public void setMonthlyMilkProductionLiters(BigDecimal monthlyMilkProductionLiters) {
        this.monthlyMilkProductionLiters = monthlyMilkProductionLiters;
    }

    public BigDecimal getMonthlySalesIncome() {
        return monthlySalesIncome;
    }

    public void setMonthlySalesIncome(BigDecimal monthlySalesIncome) {
        this.monthlySalesIncome = monthlySalesIncome;
    }

    public BigDecimal getMonthlyOperatingExpenses() {
        return monthlyOperatingExpenses;
    }

    public void setMonthlyOperatingExpenses(BigDecimal monthlyOperatingExpenses) {
        this.monthlyOperatingExpenses = monthlyOperatingExpenses;
    }

    public BigDecimal getMonthlyEstimatedOperatingProfit() {
        return monthlyEstimatedOperatingProfit;
    }

    public void setMonthlyEstimatedOperatingProfit(BigDecimal monthlyEstimatedOperatingProfit) {
        this.monthlyEstimatedOperatingProfit = monthlyEstimatedOperatingProfit;
    }

    public BigDecimal getOutstandingMilkPayments() {
        return outstandingMilkPayments;
    }

    public void setOutstandingMilkPayments(BigDecimal outstandingMilkPayments) {
        this.outstandingMilkPayments = outstandingMilkPayments;
    }

    public long getUpcomingHealthRemindersCount() {
        return upcomingHealthRemindersCount;
    }

    public void setUpcomingHealthRemindersCount(long upcomingHealthRemindersCount) {
        this.upcomingHealthRemindersCount = upcomingHealthRemindersCount;
    }

    public List<MilkProductionResponse> getRecentProductions() {
        return recentProductions;
    }

    public void setRecentProductions(List<MilkProductionResponse> recentProductions) {
        this.recentProductions = recentProductions;
    }

    public List<AnimalHealthRecordResponse> getUpcomingReminders() {
        return upcomingReminders;
    }

    public void setUpcomingReminders(List<AnimalHealthRecordResponse> upcomingReminders) {
        this.upcomingReminders = upcomingReminders;
    }
}
