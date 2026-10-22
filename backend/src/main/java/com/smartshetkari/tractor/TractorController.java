package com.smartshetkari.tractor;

import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.security.UserPrincipal;
import com.smartshetkari.tractor.dto.TractorRequest;
import com.smartshetkari.tractor.dto.TractorResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tractors")
public class TractorController {

    private final TractorService tractorService;

    public TractorController(TractorService tractorService) {
        this.tractorService = tractorService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TractorResponse>> createTractor(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TractorRequest request) {
        TractorResponse tractor = tractorService.createTractor(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tractor added successfully", tractor));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TractorResponse>>> listTractors(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TractorResponse> tractors = tractorService.listTractors(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(tractors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TractorResponse>> getTractor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        TractorResponse tractor = tractorService.getTractorById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(tractor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TractorResponse>> updateTractor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TractorRequest request) {
        TractorResponse tractor = tractorService.updateTractor(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Tractor details updated successfully", tractor));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TractorResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam Tractor.AvailabilityStatus status) {
        TractorResponse tractor = tractorService.updateStatus(principal.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Tractor status updated to " + status, tractor));
    }
}
