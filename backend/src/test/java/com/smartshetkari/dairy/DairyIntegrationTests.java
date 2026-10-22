package com.smartshetkari.dairy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartshetkari.auth.dto.RegisterRequest;
import com.smartshetkari.dairy.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DairyIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String farmerToken;
    private String otherFarmerToken;

    @BeforeEach
    void setup() throws Exception {
        farmerToken = registerAndGetToken("9881112233", "Ramesh Patil");
        otherFarmerToken = registerAndGetToken("9882223344", "Suresh Shinde");
    }

    private String registerAndGetToken(String mobile, String name) throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setMobileNumber(mobile);
        req.setPassword("Password@123");
        req.setConfirmPassword("Password@123");
        req.setFullName(name);
        req.setVillage("Baramati");
        req.setPreferredLanguage("en");

        // Try register, if already exists login
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        if (result.getResponse().getStatus() == 200 || result.getResponse().getStatus() == 201) {
            String json = result.getResponse().getContentAsString();
            return objectMapper.readTree(json).path("data").path("accessToken").asText();
        } else {
            // Login
            MvcResult loginRes = mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"mobileNumber\":\"" + mobile + "\",\"password\":\"Password@123\"}"))
                    .andExpect(status().isOk())
                    .andReturn();
            String json = loginRes.getResponse().getContentAsString();
            return objectMapper.readTree(json).path("data").path("accessToken").asText();
        }
    }

    @Test
    @DisplayName("Complete Dairy Management Lifecycle: Animal, Milk, Sales, Usage, Expenses, Health & Dashboard")
    void testDairyLifecycle() throws Exception {
        // 1. Register a Cow
        AnimalRequest cowReq = new AnimalRequest();
        cowReq.setName("Kapila");
        cowReq.setTagNumber("TAG-101");
        cowReq.setAnimalType(Animal.AnimalType.COW);
        cowReq.setBreed("Gir");
        cowReq.setGender(Animal.Gender.FEMALE);
        cowReq.setMilkingStatus(Animal.MilkingStatus.MILKING);
        cowReq.setHealthStatus(Animal.HealthStatus.HEALTHY);
        cowReq.setPurchaseDate(LocalDate.now().minusMonths(6));
        cowReq.setPurchaseCost(new BigDecimal("65000.00"));
        cowReq.setDailyFeedRequirement("20kg green grass, 5kg cattle feed");

        MvcResult createAnimalResult = mockMvc.perform(post("/api/v1/dairy/animals")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cowReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Kapila")))
                .andExpect(jsonPath("$.data.animalType", is("COW")))
                .andReturn();

        long animalId = objectMapper.readTree(createAnimalResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Register a Buffalo
        AnimalRequest buffaloReq = new AnimalRequest();
        buffaloReq.setName("Ganga");
        buffaloReq.setTagNumber("TAG-102");
        buffaloReq.setAnimalType(Animal.AnimalType.BUFFALO);
        buffaloReq.setBreed("Murrah");
        buffaloReq.setGender(Animal.Gender.FEMALE);
        buffaloReq.setMilkingStatus(Animal.MilkingStatus.MILKING);
        buffaloReq.setPurchaseCost(new BigDecimal("85000.00"));

        mockMvc.perform(post("/api/v1/dairy/animals")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buffaloReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.animalType", is("BUFFALO")));

        // 3. List Animals & verify count
        mockMvc.perform(get("/api/v1/dairy/animals")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));

        // 4. Record Daily Milk Production (Morning: 8L, Evening: 6L -> Total: 14L)
        MilkProductionRequest milkReq = new MilkProductionRequest();
        milkReq.setAnimalId(animalId);
        milkReq.setProductionDate(LocalDate.now());
        milkReq.setMorningLiters(new BigDecimal("8.00"));
        milkReq.setEveningLiters(new BigDecimal("6.00"));

        mockMvc.perform(post("/api/v1/dairy/milk-production")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(milkReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalLiters", is(14.0)));

        // 5. Test Duplicate Prevention (Upsert on same animal & date, updates instead of crashing)
        milkReq.setEveningLiters(new BigDecimal("7.00")); // total becomes 15L
        mockMvc.perform(post("/api/v1/dairy/milk-production")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(milkReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalLiters", is(15.0)));

        // 6. Record Milk Sales (10L @ Rs. 60/L = Rs. 600, Paid: Rs. 400, Unpaid: Rs. 200)
        MilkSaleRequest saleReq = new MilkSaleRequest();
        saleReq.setSaleDate(LocalDate.now());
        saleReq.setBuyerName("Amul Dairy Center");
        saleReq.setQuantityLiters(new BigDecimal("10.00"));
        saleReq.setPricePerLiter(new BigDecimal("60.00"));
        saleReq.setPaidAmount(new BigDecimal("400.00"));
        saleReq.setPaymentStatus(MilkSale.PaymentStatus.PARTIALLY_PAID);

        mockMvc.perform(post("/api/v1/dairy/milk-sales")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saleReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalAmount", is(600.0)))
                .andExpect(jsonPath("$.data.balanceDue", is(200.0)));

        // 7. Record Home Milk Usage (3L for home, 1L for calf)
        MilkUsageRequest usageReq = new MilkUsageRequest();
        usageReq.setUsageDate(LocalDate.now());
        usageReq.setHomeConsumptionLiters(new BigDecimal("3.00"));
        usageReq.setCalfFeedingLiters(new BigDecimal("1.00"));

        mockMvc.perform(post("/api/v1/dairy/milk-usage")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usageReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalUsedLiters", is(4.0)));

        // 8. Record Dairy Expense (Feed: Rs. 250)
        DairyExpenseRequest feedExp = new DairyExpenseRequest();
        feedExp.setAnimalId(animalId);
        feedExp.setCategory(DairyExpense.ExpenseCategory.FEED_FODDER);
        feedExp.setAmount(new BigDecimal("250.00"));
        feedExp.setExpenseDate(LocalDate.now());
        feedExp.setDescription("Cattle feed pellets 10kg");

        mockMvc.perform(post("/api/v1/dairy/expenses")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feedExp)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.amount", is(250.0)));

        // 9. Record Animal Health Event (FMD Vaccination)
        AnimalHealthRecordRequest healthReq = new AnimalHealthRecordRequest();
        healthReq.setAnimalId(animalId);
        healthReq.setRecordDate(LocalDate.now());
        healthReq.setRecordType(AnimalHealthRecord.RecordType.VACCINATION);
        healthReq.setTreatmentName("FMD Booster Vaccine");
        healthReq.setCost(new BigDecimal("150.00"));
        healthReq.setNextDueDate(LocalDate.now().plusMonths(6));

        mockMvc.perform(post("/api/v1/dairy/health")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(healthReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.treatmentName", is("FMD Booster Vaccine")));

        // 10. Verify Dairy Dashboard
        mockMvc.perform(get("/api/v1/dairy/dashboard")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalAnimals", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data.todayMilkProductionLiters", is(15.0)))
                .andExpect(jsonPath("$.data.todayMilkSoldLiters", is(10.0)))
                .andExpect(jsonPath("$.data.todayMilkUsedLiters", is(4.0)))
                .andExpect(jsonPath("$.data.todayMilkSalesIncome", is(600.0)))
                .andExpect(jsonPath("$.data.todayExpenses", is(250.0)))
                .andExpect(jsonPath("$.data.todayEstimatedProfit", is(350.0)))
                .andExpect(jsonPath("$.data.outstandingMilkPayments", is(200.0)));

        // 11. Verify Profit and Loss Report
        mockMvc.perform(get("/api/v1/dairy/profit-loss")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalMilkProducedLiters", is(15.0)))
                .andExpect(jsonPath("$.data.totalMilkSoldLiters", is(10.0)))
                .andExpect(jsonPath("$.data.unsoldMilkLiters", is(1.0))) // 15L - 10L sold - 4L used = 1L unsold
                .andExpect(jsonPath("$.data.operatingProfit", is(350.0))); // 600 - 250 = 350

        // 12. Test Data Isolation (Other farmer cannot access or delete animal)
        mockMvc.perform(get("/api/v1/dairy/animals/" + animalId)
                        .header("Authorization", "Bearer " + otherFarmerToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/dairy/animals/" + animalId)
                        .header("Authorization", "Bearer " + otherFarmerToken))
                .andExpect(status().isNotFound());
    }
}
