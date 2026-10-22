package com.smartshetkari.payment;

import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.payment.dto.TractorPaymentRequest;
import com.smartshetkari.payment.dto.TractorPaymentResponse;
import com.smartshetkari.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tractor-payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TractorPaymentResponse>> recordPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TractorPaymentRequest request) {
        TractorPaymentResponse response = paymentService.recordPayment(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment recorded successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TractorPaymentResponse>>> listPayments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long bookingId) {
        List<TractorPaymentResponse> payments = paymentService.listPayments(principal.getId(), bookingId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }
}
