package com.smartshetkari.dairy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class DairyProfitLossResponse {

    private LocalDate startDate;
    private LocalDate endDate;

    // Production & Sales volume
    private BigDecimal totalMilkProducedLiters;
    private BigDecimal totalMilkSoldLiters;
    private BigDecimal totalMilkUsedLiters;
    private BigDecimal unsoldMilkLiters;

    // Revenue
    private BigDecimal totalMilkSalesIncome;
    private BigDecimal cashReceivedFromSales;
    private BigDecimal outstandingReceivables;

    // Operating Expenses
    private BigDecimal totalOperatingExpenses;
    private Map<String, BigDecimal> expensesByCategory;

    // Profitability
    private BigDecimal operatingProfit;
    private BigDecimal netCashFlow;

    // Capital
    private BigDecimal capitalInvestment;

    // Breakdowns
    private Map<String, BigDecimal> productionByAnimalType;
    private List<AnimalProfitabilityDto> animalProfitability;

    public static class AnimalProfitabilityDto {
        private Long animalId;
        private String tagNumber;
        private String name;
        private String animalType;
        private BigDecimal milkLiters;
        private BigDecimal milkIncome;
        private BigDecimal expenses;
        private BigDecimal netProfit;

        public AnimalProfitabilityDto() {
        }

        public Long getAnimalId() {
            return animalId;
        }

        public void setAnimalId(Long animalId) {
            this.animalId = animalId;
        }

        public String getTagNumber() {
            return tagNumber;
        }

        public void setTagNumber(String tagNumber) {
            this.tagNumber = tagNumber;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getAnimalType() {
            return animalType;
        }

        public void setAnimalType(String animalType) {
            this.animalType = animalType;
        }

        public BigDecimal getMilkLiters() {
            return milkLiters;
        }

        public void setMilkLiters(BigDecimal milkLiters) {
            this.milkLiters = milkLiters;
        }

        public BigDecimal getMilkIncome() {
            return milkIncome;
        }

        public void setMilkIncome(BigDecimal milkIncome) {
            this.milkIncome = milkIncome;
        }

        public BigDecimal getExpenses() {
            return expenses;
        }

        public void setExpenses(BigDecimal expenses) {
            this.expenses = expenses;
        }

        public BigDecimal getNetProfit() {
            return netProfit;
        }

        public void setNetProfit(BigDecimal netProfit) {
            this.netProfit = netProfit;
        }
    }

    public DairyProfitLossResponse() {
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalMilkProducedLiters() {
        return totalMilkProducedLiters;
    }

    public void setTotalMilkProducedLiters(BigDecimal totalMilkProducedLiters) {
        this.totalMilkProducedLiters = totalMilkProducedLiters;
    }

    public BigDecimal getTotalMilkSoldLiters() {
        return totalMilkSoldLiters;
    }

    public void setTotalMilkSoldLiters(BigDecimal totalMilkSoldLiters) {
        this.totalMilkSoldLiters = totalMilkSoldLiters;
    }

    public BigDecimal getTotalMilkUsedLiters() {
        return totalMilkUsedLiters;
    }

    public void setTotalMilkUsedLiters(BigDecimal totalMilkUsedLiters) {
        this.totalMilkUsedLiters = totalMilkUsedLiters;
    }

    public BigDecimal getUnsoldMilkLiters() {
        return unsoldMilkLiters;
    }

    public void setUnsoldMilkLiters(BigDecimal unsoldMilkLiters) {
        this.unsoldMilkLiters = unsoldMilkLiters;
    }

    public BigDecimal getTotalMilkSalesIncome() {
        return totalMilkSalesIncome;
    }

    public void setTotalMilkSalesIncome(BigDecimal totalMilkSalesIncome) {
        this.totalMilkSalesIncome = totalMilkSalesIncome;
    }

    public BigDecimal getCashReceivedFromSales() {
        return cashReceivedFromSales;
    }

    public void setCashReceivedFromSales(BigDecimal cashReceivedFromSales) {
        this.cashReceivedFromSales = cashReceivedFromSales;
    }

    public BigDecimal getOutstandingReceivables() {
        return outstandingReceivables;
    }

    public void setOutstandingReceivables(BigDecimal outstandingReceivables) {
        this.outstandingReceivables = outstandingReceivables;
    }

    public BigDecimal getTotalOperatingExpenses() {
        return totalOperatingExpenses;
    }

    public void setTotalOperatingExpenses(BigDecimal totalOperatingExpenses) {
        this.totalOperatingExpenses = totalOperatingExpenses;
    }

    public Map<String, BigDecimal> getExpensesByCategory() {
        return expensesByCategory;
    }

    public void setExpensesByCategory(Map<String, BigDecimal> expensesByCategory) {
        this.expensesByCategory = expensesByCategory;
    }

    public BigDecimal getOperatingProfit() {
        return operatingProfit;
    }

    public void setOperatingProfit(BigDecimal operatingProfit) {
        this.operatingProfit = operatingProfit;
    }

    public BigDecimal getNetCashFlow() {
        return netCashFlow;
    }

    public void setNetCashFlow(BigDecimal netCashFlow) {
        this.netCashFlow = netCashFlow;
    }

    public BigDecimal getCapitalInvestment() {
        return capitalInvestment;
    }

    public void setCapitalInvestment(BigDecimal capitalInvestment) {
        this.capitalInvestment = capitalInvestment;
    }

    public Map<String, BigDecimal> getProductionByAnimalType() {
        return productionByAnimalType;
    }

    public void setProductionByAnimalType(Map<String, BigDecimal> productionByAnimalType) {
        this.productionByAnimalType = productionByAnimalType;
    }

    public List<AnimalProfitabilityDto> getAnimalProfitability() {
        return animalProfitability;
    }

    public void setAnimalProfitability(List<AnimalProfitabilityDto> animalProfitability) {
        this.animalProfitability = animalProfitability;
    }
}
