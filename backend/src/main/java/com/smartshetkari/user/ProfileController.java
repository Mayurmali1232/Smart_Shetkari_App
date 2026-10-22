package com.smartshetkari.user;

import com.smartshetkari.common.ApiResponse;
import com.smartshetkari.security.UserPrincipal;
import com.smartshetkari.user.dto.ChangeLanguageRequest;
import com.smartshetkari.user.dto.ProfileResponse;
import com.smartshetkari.user.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        ProfileResponse profile = userService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        ProfileResponse profile = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @PatchMapping("/language")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateLanguage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangeLanguageRequest request) {
        ProfileResponse profile = userService.updateLanguage(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Language updated successfully", profile));
    }
}
