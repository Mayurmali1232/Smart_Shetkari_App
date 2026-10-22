package com.smartshetkari;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartshetkari.attendance.Attendance;
import com.smartshetkari.attendance.dto.AttendanceRecordRequest;
import com.smartshetkari.attendance.dto.BulkAttendanceRequest;
import com.smartshetkari.auth.dto.LoginRequest;
import com.smartshetkari.auth.dto.RegisterRequest;
import com.smartshetkari.booking.TractorBooking;
import com.smartshetkari.booking.dto.BookingRequest;
import com.smartshetkari.booking.dto.CompleteWorkRequest;
import com.smartshetkari.employee.Employee;
import com.smartshetkari.employee.dto.EmployeeRequest;
import com.smartshetkari.expense.TractorExpense;
import com.smartshetkari.expense.dto.TractorExpenseRequest;
import com.smartshetkari.payment.dto.TractorPaymentRequest;
import com.smartshetkari.tractor.Tractor;
import com.smartshetkari.tractor.dto.TractorRequest;
import com.smartshetkari.wage.dto.CreateWageRecordRequest;
import com.smartshetkari.wage.dto.WageCalculationRequest;
import com.smartshetkari.wage.dto.WagePaymentRequest;
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
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SmartShetkariApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String obtainAccessToken(String mobile, String name) throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setFullName(name);
        register.setMobileNumber(mobile);
        register.setPassword("secret123");
        register.setConfirmPassword("secret123");
        register.setVillage("Baramati");
        register.setDistrict("Pune");
        register.setState("Maharashtra");
        register.setPreferredLanguage("mr");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        return objectMapper.readTree(responseStr).path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Module 1: Authentication - Registration, Login, Token Generation & Validation")
    void testAuthenticationFlow() throws Exception {
        String mobile = "9823000001";
        String token = obtainAccessToken(mobile, "Ramesh Patil");

        // Login with correct credentials
        LoginRequest login = new LoginRequest(mobile, "secret123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.fullName", is("Ramesh Patil")))
                .andExpect(jsonPath("$.data.preferredLanguage", is("mr")))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()));

        // Login with invalid credentials fails
        LoginRequest badLogin = new LoginRequest(mobile, "wrongpassword");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));

        // Duplicate registration with same mobile is prevented
        RegisterRequest duplicate = new RegisterRequest();
        duplicate.setFullName("Duplicate Patil");
        duplicate.setMobileNumber(mobile);
        duplicate.setPassword("secret123");
        duplicate.setConfirmPassword("secret123");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("Module 2: Multilingual Settings - Switch language and persist in profile")
    void testLanguagePreferences() throws Exception {
        String token = obtainAccessToken("9823000002", "Suresh Shinde");

        // Change language to Hindi ('hi')
        mockMvc.perform(patch("/api/v1/profile/language")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"language\": \"hi\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.preferredLanguage", is("hi")));

        // Verify profile returns updated language
        mockMvc.perform(get("/api/v1/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.preferredLanguage", is("hi")));
    }

    @Test
    @DisplayName("Module 4 & 5: Employee & Attendance Management with Wage Historical Integrity")
    void testEmployeeAndAttendanceFlow() throws Exception {
        String token = obtainAccessToken("9823000003", "Anand Deshmukh");

        // 1. Add Employee
        EmployeeRequest empReq = new EmployeeRequest();
        empReq.setFullName("Tukaram Jadhav");
        empReq.setMobileNumber("9988776655");
        empReq.setVillageAddress("Koregaon");
        empReq.setDailyWage(new BigDecimal("500.00"));
        empReq.setWageType(Employee.WageType.DAILY);
        empReq.setJoiningDate(LocalDate.now().minusDays(10));
        empReq.setStatus(Employee.EmploymentStatus.ACTIVE);

        MvcResult empResult = mockMvc.perform(post("/api/v1/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(empReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.fullName", is("Tukaram Jadhav")))
                .andExpect(jsonPath("$.data.dailyWage", is(500.00)))
                .andReturn();

        long empId = objectMapper.readTree(empResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 2. Mark Attendance for 2 days (Day 1: Present, Day 2: Half-Day)
        AttendanceRecordRequest day1 = new AttendanceRecordRequest();
        day1.setEmployeeId(empId);
        day1.setStatus(Attendance.AttendanceStatus.PRESENT);
        day1.setNotes("Plowing field");

        mockMvc.perform(post("/api/v1/attendance")
                        .header("Authorization", "Bearer " + token)
                        .param("date", LocalDate.now().minusDays(2).toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(day1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("PRESENT")))
                .andExpect(jsonPath("$.data.dailyWageRate", is(500.00)));

        AttendanceRecordRequest day2 = new AttendanceRecordRequest();
        day2.setEmployeeId(empId);
        day2.setStatus(Attendance.AttendanceStatus.HALF_DAY);

        mockMvc.perform(post("/api/v1/attendance")
                        .header("Authorization", "Bearer " + token)
                        .param("date", LocalDate.now().minusDays(1).toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(day2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("HALF_DAY")));

        // 3. Test Business Rule: Update worker's daily wage to ₹600.00
        empReq.setDailyWage(new BigDecimal("600.00"));
        mockMvc.perform(put("/api/v1/employees/" + empId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(empReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.dailyWage", is(600.00)));

        // 4. Verify historical attendance record still retains ₹500.00 dailyWageRate!
        mockMvc.perform(get("/api/v1/attendance")
                        .header("Authorization", "Bearer " + token)
                        .param("date", LocalDate.now().minusDays(2).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].dailyWageRate", is(500.00)));
    }

    @Test
    @DisplayName("Module 6: Wage Calculation, Manual Override, Partial Payment & Balance Reconciliation")
    void testWageManagementAndManualOverride() throws Exception {
        String token = obtainAccessToken("9823000004", "Dnyaneshwar Shinde");

        // 1. Create worker
        EmployeeRequest empReq = new EmployeeRequest();
        empReq.setFullName("Kisan Kadam");
        empReq.setDailyWage(new BigDecimal("500.00"));
        empReq.setJoiningDate(LocalDate.now().minusDays(15));
        MvcResult empResult = mockMvc.perform(post("/api/v1/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(empReq)))
                .andExpect(status().isCreated())
                .andReturn();
        long empId = objectMapper.readTree(empResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 2. Mark 3 days attendance (2 full days = ₹1000, 1 half day = ₹250, Total suggested = ₹1250)
        for (int i = 1; i <= 2; i++) {
            AttendanceRecordRequest att = new AttendanceRecordRequest();
            att.setEmployeeId(empId);
            att.setStatus(Attendance.AttendanceStatus.PRESENT);
            mockMvc.perform(post("/api/v1/attendance")
                            .header("Authorization", "Bearer " + token)
                            .param("date", LocalDate.now().minusDays(i + 1).toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(att)))
                    .andExpect(status().isCreated());
        }
        AttendanceRecordRequest half = new AttendanceRecordRequest();
        half.setEmployeeId(empId);
        half.setStatus(Attendance.AttendanceStatus.HALF_DAY);
        mockMvc.perform(post("/api/v1/attendance")
                        .header("Authorization", "Bearer " + token)
                        .param("date", LocalDate.now().minusDays(1).toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(half)))
                .andExpect(status().isCreated());

        // 3. Calculate suggested wage
        WageCalculationRequest calcReq = new WageCalculationRequest(empId, LocalDate.now().minusDays(5), LocalDate.now());
        mockMvc.perform(post("/api/v1/wages/calculate")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(calcReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.suggestedWage", is(1250.00)))
                .andExpect(jsonPath("$.data.totalDaysWorked", is(2.5)));

        // 4. Farmer manually adjusts final wage to ₹1200.00
        CreateWageRecordRequest wageRec = new CreateWageRecordRequest();
        wageRec.setEmployeeId(empId);
        wageRec.setStartDate(LocalDate.now().minusDays(5));
        wageRec.setEndDate(LocalDate.now());
        wageRec.setSuggestedWage(new BigDecimal("1250.00"));
        wageRec.setFinalAgreedWage(new BigDecimal("1200.00")); // Manual adjustment!
        wageRec.setNotes("Rounded off per mutual agreement");

        MvcResult wageResult = mockMvc.perform(post("/api/v1/wages")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wageRec)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.suggestedWage", is(1250.00)))
                .andExpect(jsonPath("$.data.finalAgreedWage", is(1200.00)))
                .andExpect(jsonPath("$.data.outstandingBalance", is(1200.00)))
                .andReturn();

        long wageRecordId = objectMapper.readTree(wageResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 5. Farmer pays partial payment of ₹800.00
        WagePaymentRequest payReq = new WagePaymentRequest();
        payReq.setEmployeeId(empId);
        payReq.setWageRecordId(wageRecordId);
        payReq.setAmount(new BigDecimal("800.00"));
        payReq.setPaymentMethod(com.smartshetkari.wage.WagePayment.PaymentMethod.UPI);
        payReq.setReferenceNumber("UPI-1234567890");

        mockMvc.perform(post("/api/v1/wages/payments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.amount", is(800.00)));

        // 6. Verify balances: Agreed ₹1200, Paid ₹800, Remaining ₹400
        mockMvc.perform(get("/api/v1/wages/balances")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].totalAgreedWages", is(1200.00)))
                .andExpect(jsonPath("$.data[0].totalPaid", is(800.00)))
                .andExpect(jsonPath("$.data[0].outstandingBalance", is(400.00)));
    }

    @Test
    @DisplayName("Module 7 & 8: Tractor Booking, Overlap Prevention, and Work Completion")
    void testTractorBookingAndOverlapPrevention() throws Exception {
        String token = obtainAccessToken("9823000005", "Baburao Gholap");

        // 1. Add Tractor
        TractorRequest tractorReq = new TractorRequest();
        tractorReq.setModelName("Mahindra 575 DI");
        tractorReq.setRegistrationNumber("MH 14 AB 1000");
        tractorReq.setOwnershipType(Tractor.OwnershipType.OWNED);
        tractorReq.setDefaultHourlyRate(new BigDecimal("800.00"));
        tractorReq.setDefaultPerAcreRate(new BigDecimal("1200.00"));

        MvcResult tracResult = mockMvc.perform(post("/api/v1/tractors")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tractorReq)))
                .andExpect(status().isCreated())
                .andReturn();
        long tractorId = objectMapper.readTree(tracResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 2. Create Confirmed Booking from 09:00 to 12:00
        LocalDate bookingDate = LocalDate.now().plusDays(3);
        BookingRequest b1 = new BookingRequest();
        b1.setTractorId(tractorId);
        b1.setCustomerName("Vijay Mane");
        b1.setWorkDate(bookingDate);
        b1.setStartTime(LocalTime.of(9, 0));
        b1.setEndTime(LocalTime.of(12, 0));
        b1.setWorkType(TractorBooking.WorkType.PLOWING);
        b1.setFinalAgreedAmount(new BigDecimal("2400.00"));
        b1.setStatus(TractorBooking.BookingStatus.CONFIRMED);

        MvcResult b1Result = mockMvc.perform(post("/api/v1/tractor-bookings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(b1)))
                .andExpect(status().isCreated())
                .andReturn();
        long b1Id = objectMapper.readTree(b1Result.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 3. Attempt overlapping Confirmed Booking from 11:00 to 14:00 on same tractor -> Must FAIL with conflict error!
        BookingRequest b2 = new BookingRequest();
        b2.setTractorId(tractorId);
        b2.setCustomerName("Popatlal");
        b2.setWorkDate(bookingDate);
        b2.setStartTime(LocalTime.of(11, 0));
        b2.setEndTime(LocalTime.of(14, 0));
        b2.setWorkType(TractorBooking.WorkType.ROTAVATOR);
        b2.setFinalAgreedAmount(new BigDecimal("2000.00"));
        b2.setStatus(TractorBooking.BookingStatus.CONFIRMED);

        mockMvc.perform(post("/api/v1/tractor-bookings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(b2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Overlap conflict")));

        // 4. Complete Work on booking b1 with actual hours
        CompleteWorkRequest complete = new CompleteWorkRequest();
        complete.setActualHours(3.5);
        complete.setActualAreaAcres(new BigDecimal("2.5"));
        complete.setFinalAgreedAmount(new BigDecimal("2500.00")); // Adjusted for extra 30 mins
        complete.setWorkSummary("Completed deep plowing");

        mockMvc.perform(post("/api/v1/tractor-bookings/" + b1Id + "/complete")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(complete)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("COMPLETED")))
                .andExpect(jsonPath("$.data.actualHours", is(3.5)))
                .andExpect(jsonPath("$.data.finalAgreedAmount", is(2500.00)));
    }

    @Test
    @DisplayName("Module 9 & 10: Payments, Expenses, Realized Cash vs Work Value, Dashboard & CSV Export")
    void testFinancialsAndReports() throws Exception {
        String token = obtainAccessToken("9823000006", "Pandurang Gaikwad");

        // 1. Record customer payment: ₹1500.00
        TractorPaymentRequest payReq = new TractorPaymentRequest();
        payReq.setCustomerName("Sunil Joshi");
        payReq.setAmount(new BigDecimal("1500.00"));
        payReq.setPaymentDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/tractor-payments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.amount", is(1500.00)));

        // 2. Record diesel expense: ₹500.00
        TractorExpenseRequest expReq = new TractorExpenseRequest();
        expReq.setCategory(TractorExpense.ExpenseCategory.DIESEL);
        expReq.setAmount(new BigDecimal("500.00"));
        expReq.setExpenseDate(LocalDate.now());
        expReq.setDescription("5 liters diesel");

        mockMvc.perform(post("/api/v1/tractor-expenses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.amount", is(500.00)));

        // 3. Test Dashboard Stats
        mockMvc.perform(get("/api/v1/reports/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.monthlyIncome", is(1500.00)))
                .andExpect(jsonPath("$.data.monthlyExpenses", is(500.00)));

        // 4. Test Financial Summary
        mockMvc.perform(get("/api/v1/reports/financial-summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalTractorIncomeCollected", is(1500.00)))
                .andExpect(jsonPath("$.data.totalTractorExpenses", is(500.00)))
                .andExpect(jsonPath("$.data.netProfit", is(1000.00)));

        // 5. Test CSV Export
        mockMvc.perform(get("/api/v1/reports/export/csv")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv; charset=UTF-8"))
                .andExpect(content().string(containsString("Smart Shetkari - Financial Summary Report")))
                .andExpect(content().string(containsString("Actual Tractor Income Collected,1500.00")))
                .andExpect(content().string(containsString("Net Realized Cash Profit,1000.00")));
    }
}
