package com.smartshetkari.employee;

import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.employee.dto.EmployeeRequest;
import com.smartshetkari.employee.dto.EmployeeResponse;
import com.smartshetkari.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Worker added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> listEmployees(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Employee.EmploymentStatus status,
            @RequestParam(required = false) String search) {
        List<EmployeeResponse> employees = employeeService.listEmployees(principal.getId(), status, search);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployee(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        EmployeeResponse employee = employeeService.getEmployeeById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse employee = employeeService.updateEmployee(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Worker updated successfully", employee));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EmployeeResponse>> toggleStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam Employee.EmploymentStatus status) {
        EmployeeResponse employee = employeeService.toggleStatus(principal.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Worker status updated to " + status, employee));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Map<String, Object> history = employeeService.getWorkHistory(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
