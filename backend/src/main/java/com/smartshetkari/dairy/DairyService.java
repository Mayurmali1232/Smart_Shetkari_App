package com.smartshetkari.dairy;

import com.smartshetkari.common.BusinessException;
import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.dairy.dto.*;
import com.smartshetkari.dairy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DairyService {

    private final AnimalRepository animalRepository;
    private final MilkProductionRepository milkProductionRepository;
    private final MilkSaleRepository milkSaleRepository;
    private final MilkUsageRepository milkUsageRepository;
    private final DairyExpenseRepository dairyExpenseRepository;
    private final AnimalHealthRecordRepository animalHealthRecordRepository;

    public DairyService(AnimalRepository animalRepository,
                        MilkProductionRepository milkProductionRepository,
                        MilkSaleRepository milkSaleRepository,
                        MilkUsageRepository milkUsageRepository,
                        DairyExpenseRepository dairyExpenseRepository,
                        AnimalHealthRecordRepository animalHealthRecordRepository) {
        this.animalRepository = animalRepository;
        this.milkProductionRepository = milkProductionRepository;
        this.milkSaleRepository = milkSaleRepository;
        this.milkUsageRepository = milkUsageRepository;
        this.dairyExpenseRepository = dairyExpenseRepository;
        this.animalHealthRecordRepository = animalHealthRecordRepository;
    }

    // ==========================================
    // 1. ANIMAL MANAGEMENT
    // ==========================================

    @Transactional
    public AnimalResponse createAnimal(Long farmerId, AnimalRequest request) {
        Animal animal = new Animal(
                farmerId,
                request.getTagNumber(),
                request.getName(),
                request.getAnimalType(),
                request.getBreed(),
                request.getDateOfBirth(),
                request.getAgeYears(),
                request.getGender(),
                request.getPurchaseDate(),
                request.getPurchaseCost(),
                request.getHealthStatus(),
                request.getMilkingStatus(),
                request.getStatus(),
                request.getDailyFeedRequirement(),
                request.getPhotoUrl(),
                request.getNotes()
        );
        animal.setVaccinationSummary(request.getVaccinationSummary());

        animal = animalRepository.save(animal);
        return mapToAnimalResponse(animal);
    }

    @Transactional(readOnly = true)
    public List<AnimalResponse> listAnimals(Long farmerId, Animal.AnimalType type,
                                           Animal.AnimalStatus status, Animal.MilkingStatus milkingStatus) {
        List<Animal> animals = animalRepository.filterAnimals(farmerId, type, status, milkingStatus);
        return animals.stream()
                .map(this::mapToAnimalResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AnimalResponse getAnimalById(Long farmerId, Long id) {
        Animal animal = animalRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with ID: " + id));
        return mapToAnimalResponse(animal);
    }

    @Transactional
    public AnimalResponse updateAnimal(Long farmerId, Long id, AnimalRequest request) {
        Animal animal = animalRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with ID: " + id));

        animal.setTagNumber(request.getTagNumber());
        animal.setName(request.getName());
        animal.setAnimalType(request.getAnimalType());
        animal.setBreed(request.getBreed());
        animal.setDateOfBirth(request.getDateOfBirth());
        animal.setAgeYears(request.getAgeYears());
        animal.setGender(request.getGender());
        animal.setPurchaseDate(request.getPurchaseDate());
        if (request.getPurchaseCost() != null) {
            animal.setPurchaseCost(request.getPurchaseCost());
        }
        animal.setHealthStatus(request.getHealthStatus());
        animal.setMilkingStatus(request.getMilkingStatus());
        animal.setStatus(request.getStatus());
        animal.setDailyFeedRequirement(request.getDailyFeedRequirement());
        animal.setPhotoUrl(request.getPhotoUrl());
        animal.setVaccinationSummary(request.getVaccinationSummary());
        animal.setNotes(request.getNotes());

        animal = animalRepository.save(animal);
        return mapToAnimalResponse(animal);
    }

    @Transactional
    public void deleteAnimal(Long farmerId, Long id) {
        Animal animal = animalRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with ID: " + id));
        animalRepository.delete(animal);
    }

    // ==========================================
    // 2. DAILY MILK PRODUCTION TRACKING
    // ==========================================

    @Transactional
    public MilkProductionResponse recordMilkProduction(Long farmerId, MilkProductionRequest request) {
        Animal animal = animalRepository.findByIdAndFarmerId(request.getAnimalId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with ID: " + request.getAnimalId()));

        BigDecimal morning = request.getMorningLiters() != null ? request.getMorningLiters() : BigDecimal.ZERO;
        BigDecimal evening = request.getEveningLiters() != null ? request.getEveningLiters() : BigDecimal.ZERO;
        BigDecimal total = request.getTotalLiters() != null ? request.getTotalLiters() : morning.add(evening);

        // Upsert if record for this animal and date already exists (prevents duplicate error while retaining accuracy)
        Optional<MilkProduction> existing = milkProductionRepository.findByAnimalIdAndProductionDate(
                animal.getId(), request.getProductionDate()
        );

        MilkProduction record;
        if (existing.isPresent()) {
            record = existing.get();
            record.setMorningLiters(morning);
            record.setEveningLiters(evening);
            record.setTotalLiters(total);
            record.setNotes(request.getNotes());
        } else {
            record = new MilkProduction(
                    farmerId,
                    animal,
                    request.getProductionDate(),
                    morning,
                    evening,
                    total,
                    request.getNotes()
            );
        }

        record = milkProductionRepository.save(record);
        return mapToMilkProductionResponse(record);
    }

    @Transactional(readOnly = true)
    public List<MilkProductionResponse> listMilkProductions(Long farmerId, LocalDate startDate,
                                                           LocalDate endDate, Long animalId) {
        List<MilkProduction> records;
        if (animalId != null) {
            records = milkProductionRepository.findByAnimalIdOrderByProductionDateDesc(animalId);
        } else if (startDate != null && endDate != null) {
            records = milkProductionRepository.findByFarmerIdAndProductionDateBetweenOrderByProductionDateDesc(farmerId, startDate, endDate);
        } else if (startDate != null) {
            records = milkProductionRepository.findByFarmerIdAndProductionDateOrderByAnimalNameAsc(farmerId, startDate);
        } else {
            records = milkProductionRepository.findByFarmerIdAndProductionDateOrderByAnimalNameAsc(farmerId, LocalDate.now());
        }

        return records.stream()
                .map(this::mapToMilkProductionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MilkProductionResponse updateMilkProduction(Long farmerId, Long id, MilkProductionRequest request) {
        MilkProduction record = milkProductionRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Milk production record not found with ID: " + id));

        BigDecimal morning = request.getMorningLiters() != null ? request.getMorningLiters() : BigDecimal.ZERO;
        BigDecimal evening = request.getEveningLiters() != null ? request.getEveningLiters() : BigDecimal.ZERO;
        BigDecimal total = request.getTotalLiters() != null ? request.getTotalLiters() : morning.add(evening);

        record.setMorningLiters(morning);
        record.setEveningLiters(evening);
        record.setTotalLiters(total);
        record.setNotes(request.getNotes());

        record = milkProductionRepository.save(record);
        return mapToMilkProductionResponse(record);
    }

    @Transactional
    public void deleteMilkProduction(Long farmerId, Long id) {
        MilkProduction record = milkProductionRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Milk production record not found with ID: " + id));
        milkProductionRepository.delete(record);
    }

    // ==========================================
    // 3. MILK SALES AND INCOME MANAGEMENT
    // ==========================================

    @Transactional
    public MilkSaleResponse recordMilkSale(Long farmerId, MilkSaleRequest request) {
        BigDecimal total = request.getTotalAmount() != null
                ? request.getTotalAmount()
                : request.getQuantityLiters().multiply(request.getPricePerLiter());

        BigDecimal paid = request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO;
        MilkSale.PaymentStatus status = request.getPaymentStatus();
        if (status == null) {
            if (paid.compareTo(BigDecimal.ZERO) <= 0) {
                status = MilkSale.PaymentStatus.UNPAID;
            } else if (paid.compareTo(total) >= 0) {
                status = MilkSale.PaymentStatus.PAID;
            } else {
                status = MilkSale.PaymentStatus.PARTIALLY_PAID;
            }
        }

        MilkSale sale = new MilkSale(
                farmerId,
                request.getSaleDate(),
                request.getBuyerName(),
                request.getBuyerContact(),
                request.getQuantityLiters(),
                request.getPricePerLiter(),
                total,
                paid,
                status,
                request.getPaymentMethod(),
                request.getNotes()
        );

        sale = milkSaleRepository.save(sale);
        return mapToMilkSaleResponse(sale);
    }

    @Transactional(readOnly = true)
    public List<MilkSaleResponse> listMilkSales(Long farmerId, LocalDate startDate,
                                                LocalDate endDate, MilkSale.PaymentStatus status) {
        List<MilkSale> list;
        if (startDate != null && endDate != null) {
            list = milkSaleRepository.findByFarmerIdAndSaleDateBetweenOrderBySaleDateDesc(farmerId, startDate, endDate);
        } else if (status != null) {
            list = milkSaleRepository.findByFarmerIdAndPaymentStatusOrderBySaleDateDesc(farmerId, status);
        } else {
            list = milkSaleRepository.findByFarmerIdOrderBySaleDateDesc(farmerId);
        }

        return list.stream()
                .map(this::mapToMilkSaleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MilkSaleResponse updateMilkSale(Long farmerId, Long id, MilkSaleRequest request) {
        MilkSale sale = milkSaleRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Milk sale record not found with ID: " + id));

        BigDecimal total = request.getTotalAmount() != null
                ? request.getTotalAmount()
                : request.getQuantityLiters().multiply(request.getPricePerLiter());
        BigDecimal paid = request.getPaidAmount() != null ? request.getPaidAmount() : sale.getPaidAmount();

        sale.setSaleDate(request.getSaleDate());
        sale.setBuyerName(request.getBuyerName());
        sale.setBuyerContact(request.getBuyerContact());
        sale.setQuantityLiters(request.getQuantityLiters());
        sale.setPricePerLiter(request.getPricePerLiter());
        sale.setTotalAmount(total);
        sale.setPaidAmount(paid);
        sale.setPaymentStatus(request.getPaymentStatus());
        sale.setPaymentMethod(request.getPaymentMethod());
        sale.setNotes(request.getNotes());

        sale = milkSaleRepository.save(sale);
        return mapToMilkSaleResponse(sale);
    }

    @Transactional
    public void deleteMilkSale(Long farmerId, Long id) {
        MilkSale sale = milkSaleRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Milk sale record not found with ID: " + id));
        milkSaleRepository.delete(sale);
    }

    // ==========================================
    // 4. INTERNAL MILK USAGE (Home, Calves, Spoilage)
    // ==========================================

    @Transactional
    public MilkUsageResponse recordMilkUsage(Long farmerId, MilkUsageRequest request) {
        Optional<MilkUsage> existing = milkUsageRepository.findByFarmerIdAndUsageDate(farmerId, request.getUsageDate());
        MilkUsage usage;
        if (existing.isPresent()) {
            usage = existing.get();
            usage.setHomeConsumptionLiters(request.getHomeConsumptionLiters());
            usage.setCalfFeedingLiters(request.getCalfFeedingLiters());
            usage.setWastedLiters(request.getWastedLiters());
            usage.setNotes(request.getNotes());
        } else {
            usage = new MilkUsage(
                    farmerId,
                    request.getUsageDate(),
                    request.getHomeConsumptionLiters(),
                    request.getCalfFeedingLiters(),
                    request.getWastedLiters(),
                    request.getNotes()
            );
        }

        usage = milkUsageRepository.save(usage);
        return mapToMilkUsageResponse(usage);
    }

    @Transactional(readOnly = true)
    public MilkUsageResponse getMilkUsageByDate(Long farmerId, LocalDate date) {
        return milkUsageRepository.findByFarmerIdAndUsageDate(farmerId, date)
                .map(this::mapToMilkUsageResponse)
                .orElseGet(() -> {
                    MilkUsageResponse empty = new MilkUsageResponse();
                    empty.setFarmerId(farmerId);
                    empty.setUsageDate(date);
                    empty.setHomeConsumptionLiters(BigDecimal.ZERO);
                    empty.setCalfFeedingLiters(BigDecimal.ZERO);
                    empty.setWastedLiters(BigDecimal.ZERO);
                    empty.setTotalUsedLiters(BigDecimal.ZERO);
                    return empty;
                });
    }

    // ==========================================
    // 5. DAIRY & LIVESTOCK EXPENSES
    // ==========================================

    @Transactional
    public DairyExpenseResponse recordDairyExpense(Long farmerId, DairyExpenseRequest request) {
        Animal animal = null;
        if (request.getAnimalId() != null) {
            animal = animalRepository.findByIdAndFarmerId(request.getAnimalId(), farmerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Animal not found with ID: " + request.getAnimalId()));
        }

        boolean isCap = (request.getIsCapitalExpense() != null && request.getIsCapitalExpense())
                || request.getCategory() == DairyExpense.ExpenseCategory.PURCHASE_COST;

        DairyExpense expense = new DairyExpense(
                farmerId,
                animal,
                request.getCategory(),
                request.getAmount(),
                request.getQuantity(),
                request.getUnit(),
                request.getExpenseDate(),
                isCap,
                request.getDescription(),
                request.getReceiptUrl()
        );

        expense = dairyExpenseRepository.save(expense);
        return mapToDairyExpenseResponse(expense);
    }

    @Transactional(readOnly = true)
    public List<DairyExpenseResponse> listDairyExpenses(Long farmerId, LocalDate startDate,
                                                        LocalDate endDate, Long animalId) {
        List<DairyExpense> expenses;
        if (animalId != null) {
            expenses = dairyExpenseRepository.findByAnimalIdOrderByExpenseDateDesc(animalId);
        } else if (startDate != null && endDate != null) {
            expenses = dairyExpenseRepository.findByFarmerIdAndExpenseDateBetweenOrderByExpenseDateDesc(farmerId, startDate, endDate);
        } else {
            expenses = dairyExpenseRepository.findByFarmerIdOrderByExpenseDateDesc(farmerId);
        }

        return expenses.stream()
                .map(this::mapToDairyExpenseResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDairyExpense(Long farmerId, Long id) {
        DairyExpense expense = dairyExpenseRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Dairy expense not found with ID: " + id));
        dairyExpenseRepository.delete(expense);
    }

    // ==========================================
    // 6. ANIMAL HEALTH & VACCINATION TRACKING
    // ==========================================

    @Transactional
    public AnimalHealthRecordResponse recordHealthEvent(Long farmerId, AnimalHealthRecordRequest request) {
        Animal animal = animalRepository.findByIdAndFarmerId(request.getAnimalId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found with ID: " + request.getAnimalId()));

        AnimalHealthRecord record = new AnimalHealthRecord(
                farmerId,
                animal,
                request.getRecordDate(),
                request.getRecordType(),
                request.getTreatmentName(),
                request.getMedicineName(),
                request.getDoctorName(),
                request.getCost(),
                request.getNextDueDate(),
                request.getNotes()
        );

        record = animalHealthRecordRepository.save(record);

        // Update animal's vaccination summary if applicable
        if (request.getRecordType() == AnimalHealthRecord.RecordType.VACCINATION) {
            animal.setVaccinationSummary(request.getTreatmentName() + " (" + request.getRecordDate() + ")");
            animalRepository.save(animal);
        }

        return mapToAnimalHealthRecordResponse(record);
    }

    @Transactional(readOnly = true)
    public List<AnimalHealthRecordResponse> listHealthRecords(Long farmerId, Long animalId) {
        List<AnimalHealthRecord> list = animalId != null
                ? animalHealthRecordRepository.findByAnimalIdOrderByRecordDateDesc(animalId)
                : animalHealthRecordRepository.findByFarmerIdOrderByRecordDateDesc(farmerId);

        return list.stream()
                .map(this::mapToAnimalHealthRecordResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnimalHealthRecordResponse> getUpcomingReminders(Long farmerId, int daysAhead) {
        LocalDate now = LocalDate.now();
        LocalDate future = now.plusDays(daysAhead);
        List<AnimalHealthRecord> list = animalHealthRecordRepository.findUpcomingReminders(farmerId, now, future);

        return list.stream()
                .map(this::mapToAnimalHealthRecordResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteHealthRecord(Long farmerId, Long id) {
        AnimalHealthRecord record = animalHealthRecordRepository.findByIdAndFarmerId(id, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found with ID: " + id));
        animalHealthRecordRepository.delete(record);
    }

    // ==========================================
    // 7. DASHBOARD & FINANCIAL PROFIT / LOSS
    // ==========================================

    @Transactional(readOnly = true)
    public DairyDashboardResponse getDairyDashboard(Long farmerId, LocalDate date) {
        LocalDate today = date != null ? date : LocalDate.now();
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate monthEnd = today.with(TemporalAdjusters.lastDayOfMonth());

        DairyDashboardResponse res = new DairyDashboardResponse();

        // 1. Animals count
        res.setTotalAnimals(animalRepository.countByFarmerIdAndStatus(farmerId, Animal.AnimalStatus.ACTIVE));
        res.setTotalCows(animalRepository.countByFarmerIdAndAnimalTypeAndStatus(farmerId, Animal.AnimalType.COW, Animal.AnimalStatus.ACTIVE));
        res.setTotalBuffaloes(animalRepository.countByFarmerIdAndAnimalTypeAndStatus(farmerId, Animal.AnimalType.BUFFALO, Animal.AnimalStatus.ACTIVE));
        res.setTotalMilkingAnimals(animalRepository.countByFarmerIdAndMilkingStatusAndStatus(farmerId, Animal.MilkingStatus.MILKING, Animal.AnimalStatus.ACTIVE));

        // 2. Today's figures
        BigDecimal todayProd = milkProductionRepository.sumTotalLitersByDate(farmerId, today);
        BigDecimal todaySold = milkSaleRepository.sumQuantitySoldByDate(farmerId, today);
        BigDecimal todayUsed = milkUsageRepository.sumTotalUsageByDate(farmerId, today);
        BigDecimal todayIncome = milkSaleRepository.sumTotalSalesByDate(farmerId, today);
        BigDecimal todayExp = dairyExpenseRepository.sumOperatingExpensesByDate(farmerId, today);

        res.setTodayMilkProductionLiters(todayProd);
        res.setTodayMilkSoldLiters(todaySold);
        res.setTodayMilkUsedLiters(todayUsed);
        res.setTodayMilkSalesIncome(todayIncome);
        res.setTodayExpenses(todayExp);
        res.setTodayEstimatedProfit(todayIncome.subtract(todayExp));

        // 3. Monthly figures
        BigDecimal monthProd = milkProductionRepository.sumTotalLitersBetween(farmerId, monthStart, monthEnd);
        BigDecimal monthIncome = milkSaleRepository.sumTotalSalesBetween(farmerId, monthStart, monthEnd);
        BigDecimal monthExp = dairyExpenseRepository.sumOperatingExpensesBetween(farmerId, monthStart, monthEnd);

        res.setMonthlyMilkProductionLiters(monthProd);
        res.setMonthlySalesIncome(monthIncome);
        res.setMonthlyOperatingExpenses(monthExp);
        res.setMonthlyEstimatedOperatingProfit(monthIncome.subtract(monthExp));

        // 4. Receivables & Reminders
        res.setOutstandingMilkPayments(milkSaleRepository.sumOutstandingReceivables(farmerId));

        List<AnimalHealthRecord> reminders = animalHealthRecordRepository.findUpcomingReminders(farmerId, today, today.plusDays(14));
        res.setUpcomingHealthRemindersCount(reminders.size());
        res.setUpcomingReminders(reminders.stream().map(this::mapToAnimalHealthRecordResponse).collect(Collectors.toList()));

        List<MilkProduction> recentProd = milkProductionRepository.findByFarmerIdAndProductionDateOrderByAnimalNameAsc(farmerId, today);
        res.setRecentProductions(recentProd.stream().map(this::mapToMilkProductionResponse).collect(Collectors.toList()));

        return res;
    }

    @Transactional(readOnly = true)
    public DairyProfitLossResponse getProfitLossReport(Long farmerId, LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        DairyProfitLossResponse report = new DairyProfitLossResponse();
        report.setStartDate(start);
        report.setEndDate(end);

        // Production & Usage
        BigDecimal totalProduced = milkProductionRepository.sumTotalLitersBetween(farmerId, start, end);
        BigDecimal totalSold = milkSaleRepository.sumQuantitySoldBetween(farmerId, start, end);
        BigDecimal totalUsed = milkUsageRepository.sumTotalUsageBetween(farmerId, start, end);
        BigDecimal unsold = totalProduced.subtract(totalSold).subtract(totalUsed);
        if (unsold.compareTo(BigDecimal.ZERO) < 0) {
            unsold = BigDecimal.ZERO;
        }

        report.setTotalMilkProducedLiters(totalProduced);
        report.setTotalMilkSoldLiters(totalSold);
        report.setTotalMilkUsedLiters(totalUsed);
        report.setUnsoldMilkLiters(unsold);

        // Revenue (Accrual vs Cash)
        BigDecimal totalSalesIncome = milkSaleRepository.sumTotalSalesBetween(farmerId, start, end);
        BigDecimal cashReceived = milkSaleRepository.sumPaidSalesBetween(farmerId, start, end);
        BigDecimal outstanding = milkSaleRepository.sumOutstandingReceivables(farmerId);

        report.setTotalMilkSalesIncome(totalSalesIncome);
        report.setCashReceivedFromSales(cashReceived);
        report.setOutstandingReceivables(outstanding);

        // Operating Expenses
        BigDecimal totalOperatingExp = dairyExpenseRepository.sumOperatingExpensesBetween(farmerId, start, end);
        report.setTotalOperatingExpenses(totalOperatingExp);

        Map<String, BigDecimal> categoryMap = new HashMap<>();
        List<Object[]> catRows = dairyExpenseRepository.sumByCategoryBetween(farmerId, start, end);
        for (Object[] row : catRows) {
            if (row[0] != null) {
                categoryMap.put(row[0].toString(), (BigDecimal) row[1]);
            }
        }
        report.setExpensesByCategory(categoryMap);

        // Profit
        report.setOperatingProfit(totalSalesIncome.subtract(totalOperatingExp));
        report.setNetCashFlow(cashReceived.subtract(totalOperatingExp));

        // Capital Investment (Separate from operating expenses)
        BigDecimal capitalExp = dairyExpenseRepository.sumCapitalExpensesBetween(farmerId, start, end);
        report.setCapitalInvestment(capitalExp);

        // Breakdowns by animal
        List<Animal> animals = animalRepository.findByFarmerIdAndStatusOrderByCreatedAtDesc(farmerId, Animal.AnimalStatus.ACTIVE);
        List<DairyProfitLossResponse.AnimalProfitabilityDto> animalList = new ArrayList<>();
        Map<String, BigDecimal> typeMap = new HashMap<>();

        for (Animal a : animals) {
            BigDecimal aMilk = milkProductionRepository.sumTotalLitersByAnimal(a.getId());
            BigDecimal aExp = dairyExpenseRepository.sumExpensesByAnimal(a.getId());

            // Estimate milk income based on average selling price in the period
            BigDecimal avgPrice = totalSold.compareTo(BigDecimal.ZERO) > 0
                    ? totalSalesIncome.divide(totalSold, 2, RoundingMode.HALF_UP)
                    : new BigDecimal("50.00"); // default typical farm price

            BigDecimal aIncome = aMilk.multiply(avgPrice).setScale(2, RoundingMode.HALF_UP);
            BigDecimal aProfit = aIncome.subtract(aExp);

            DairyProfitLossResponse.AnimalProfitabilityDto dto = new DairyProfitLossResponse.AnimalProfitabilityDto();
            dto.setAnimalId(a.getId());
            dto.setTagNumber(a.getTagNumber());
            dto.setName(a.getName());
            dto.setAnimalType(a.getAnimalType().name());
            dto.setMilkLiters(aMilk);
            dto.setMilkIncome(aIncome);
            dto.setExpenses(aExp);
            dto.setNetProfit(aProfit);
            animalList.add(dto);

            String aTypeName = a.getAnimalType().name();
            typeMap.put(aTypeName, typeMap.getOrDefault(aTypeName, BigDecimal.ZERO).add(aMilk));
        }

        report.setAnimalProfitability(animalList);
        report.setProductionByAnimalType(typeMap);

        return report;
    }

    // ==========================================
    // MAPPERS
    // ==========================================

    private AnimalResponse mapToAnimalResponse(Animal a) {
        AnimalResponse res = new AnimalResponse();
        res.setId(a.getId());
        res.setFarmerId(a.getFarmerId());
        res.setTagNumber(a.getTagNumber());
        res.setName(a.getName());
        res.setAnimalType(a.getAnimalType());
        res.setBreed(a.getBreed());
        res.setDateOfBirth(a.getDateOfBirth());
        res.setAgeYears(a.getAgeYears());
        res.setGender(a.getGender());
        res.setPurchaseDate(a.getPurchaseDate());
        res.setPurchaseCost(a.getPurchaseCost());
        res.setHealthStatus(a.getHealthStatus());
        res.setMilkingStatus(a.getMilkingStatus());
        res.setStatus(a.getStatus());
        res.setDailyFeedRequirement(a.getDailyFeedRequirement());
        res.setPhotoUrl(a.getPhotoUrl());
        res.setVaccinationSummary(a.getVaccinationSummary());
        res.setNotes(a.getNotes());
        res.setCreatedAt(a.getCreatedAt());
        res.setUpdatedAt(a.getUpdatedAt());

        res.setTotalMilkProducedLiters(milkProductionRepository.sumTotalLitersByAnimal(a.getId()));
        res.setTotalExpensesIncurred(dairyExpenseRepository.sumExpensesByAnimal(a.getId()));
        return res;
    }

    private MilkProductionResponse mapToMilkProductionResponse(MilkProduction m) {
        MilkProductionResponse res = new MilkProductionResponse();
        res.setId(m.getId());
        res.setFarmerId(m.getFarmerId());
        res.setAnimalId(m.getAnimal().getId());
        res.setAnimalName(m.getAnimal().getName());
        res.setAnimalTagNumber(m.getAnimal().getTagNumber());
        res.setAnimalType(m.getAnimal().getAnimalType());
        res.setProductionDate(m.getProductionDate());
        res.setMorningLiters(m.getMorningLiters());
        res.setEveningLiters(m.getEveningLiters());
        res.setTotalLiters(m.getTotalLiters());
        res.setNotes(m.getNotes());
        res.setCreatedAt(m.getCreatedAt());
        res.setUpdatedAt(m.getUpdatedAt());
        return res;
    }

    private MilkSaleResponse mapToMilkSaleResponse(MilkSale s) {
        MilkSaleResponse res = new MilkSaleResponse();
        res.setId(s.getId());
        res.setFarmerId(s.getFarmerId());
        res.setSaleDate(s.getSaleDate());
        res.setBuyerName(s.getBuyerName());
        res.setBuyerContact(s.getBuyerContact());
        res.setQuantityLiters(s.getQuantityLiters());
        res.setPricePerLiter(s.getPricePerLiter());
        res.setTotalAmount(s.getTotalAmount());
        res.setPaidAmount(s.getPaidAmount());
        res.setBalanceDue(s.getTotalAmount().subtract(s.getPaidAmount()));
        res.setPaymentStatus(s.getPaymentStatus());
        res.setPaymentMethod(s.getPaymentMethod());
        res.setNotes(s.getNotes());
        res.setCreatedAt(s.getCreatedAt());
        res.setUpdatedAt(s.getUpdatedAt());
        return res;
    }

    private MilkUsageResponse mapToMilkUsageResponse(MilkUsage u) {
        MilkUsageResponse res = new MilkUsageResponse();
        res.setId(u.getId());
        res.setFarmerId(u.getFarmerId());
        res.setUsageDate(u.getUsageDate());
        res.setHomeConsumptionLiters(u.getHomeConsumptionLiters());
        res.setCalfFeedingLiters(u.getCalfFeedingLiters());
        res.setWastedLiters(u.getWastedLiters());
        res.setTotalUsedLiters(u.getTotalUsedLiters());
        res.setNotes(u.getNotes());
        res.setCreatedAt(u.getCreatedAt());
        res.setUpdatedAt(u.getUpdatedAt());
        return res;
    }

    private DairyExpenseResponse mapToDairyExpenseResponse(DairyExpense e) {
        DairyExpenseResponse res = new DairyExpenseResponse();
        res.setId(e.getId());
        res.setFarmerId(e.getFarmerId());
        if (e.getAnimal() != null) {
            res.setAnimalId(e.getAnimal().getId());
            res.setAnimalName(e.getAnimal().getName());
            res.setAnimalTagNumber(e.getAnimal().getTagNumber());
        }
        res.setCategory(e.getCategory());
        res.setAmount(e.getAmount());
        res.setQuantity(e.getQuantity());
        res.setUnit(e.getUnit());
        res.setExpenseDate(e.getExpenseDate());
        res.setCapitalExpense(e.isCapitalExpense());
        res.setDescription(e.getDescription());
        res.setReceiptUrl(e.getReceiptUrl());
        res.setCreatedAt(e.getCreatedAt());
        res.setUpdatedAt(e.getUpdatedAt());
        return res;
    }

    private AnimalHealthRecordResponse mapToAnimalHealthRecordResponse(AnimalHealthRecord h) {
        AnimalHealthRecordResponse res = new AnimalHealthRecordResponse();
        res.setId(h.getId());
        res.setFarmerId(h.getFarmerId());
        res.setAnimalId(h.getAnimal().getId());
        res.setAnimalName(h.getAnimal().getName());
        res.setAnimalTagNumber(h.getAnimal().getTagNumber());
        res.setRecordDate(h.getRecordDate());
        res.setRecordType(h.getRecordType());
        res.setTreatmentName(h.getTreatmentName());
        res.setMedicineName(h.getMedicineName());
        res.setDoctorName(h.getDoctorName());
        res.setCost(h.getCost());
        res.setNextDueDate(h.getNextDueDate());
        if (h.getNextDueDate() != null) {
            res.setIsOverdue(h.getNextDueDate().isBefore(LocalDate.now()));
        } else {
            res.setIsOverdue(false);
        }
        res.setNotes(h.getNotes());
        res.setCreatedAt(h.getCreatedAt());
        res.setUpdatedAt(h.getUpdatedAt());
        return res;
    }
}
