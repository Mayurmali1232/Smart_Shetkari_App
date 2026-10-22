package com.smartshetkari.booking;

import com.smartshetkari.booking.dto.BookingRequest;
import com.smartshetkari.booking.dto.BookingResponse;
import com.smartshetkari.booking.dto.CompleteWorkRequest;
import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tractor-bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tractor booking created successfully", booking));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> listBookings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) TractorBooking.BookingStatus status,
            @RequestParam(required = false) Long tractorId) {
        List<BookingResponse> bookings = bookingService.listBookings(principal.getId(), status, tractorId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.updateBooking(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking updated successfully", booking));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam TractorBooking.BookingStatus status) {
        BookingResponse booking = bookingService.updateStatus(principal.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated to " + status, booking));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<BookingResponse>> completeWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CompleteWorkRequest request) {
        BookingResponse booking = bookingService.completeWork(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Tractor work marked as completed and logged", booking));
    }
}
