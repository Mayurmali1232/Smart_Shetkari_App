package com.smartshetkari.auth;

import com.smartshetkari.auth.dto.*;
import com.smartshetkari.common.BusinessException;
import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.security.JwtTokenProvider;
import com.smartshetkari.user.FarmerProfile;
import com.smartshetkari.user.FarmerProfileRepository;
import com.smartshetkari.user.User;
import com.smartshetkari.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       FarmerProfileRepository profileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Password and confirm password do not match");
        }

        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new BusinessException("An account with this mobile number already exists");
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() &&
                userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BusinessException("An account with this email address already exists");
        }

        // 1. Create User
        User user = new User();
        user.setMobileNumber(request.getMobileNumber());
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail().trim());
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_FARMER");
        user.setEnabled(true);
        user = userRepository.save(user);

        // 2. Create Farmer Profile
        String lang = (request.getPreferredLanguage() != null && !request.getPreferredLanguage().trim().isEmpty())
                ? request.getPreferredLanguage().trim()
                : "mr";

        FarmerProfile profile = new FarmerProfile(
                user,
                request.getFullName(),
                request.getVillage(),
                request.getDistrict(),
                request.getState(),
                lang
        );
        profile = profileRepository.save(profile);

        // 3. Generate Tokens
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getMobileNumber(), user.getRole());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(
                accessToken,
                refreshToken,
                tokenProvider.getAccessTokenExpirationMs(),
                user.getId(),
                user.getMobileNumber(),
                profile.getFullName(),
                profile.getPreferredLanguage(),
                profile.getVillage(),
                profile.getDistrict(),
                profile.getState(),
                user.getRole()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getMobileNumber(), request.getPassword())
        );

        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .or(() -> userRepository.findByEmail(request.getMobileNumber()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FarmerProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user"));

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getMobileNumber(), user.getRole());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(
                accessToken,
                refreshToken,
                tokenProvider.getAccessTokenExpirationMs(),
                user.getId(),
                user.getMobileNumber(),
                profile.getFullName(),
                profile.getPreferredLanguage(),
                profile.getVillage(),
                profile.getDistrict(),
                profile.getState(),
                user.getRole()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new BusinessException("Invalid or expired refresh token");
        }

        Long userId = tokenProvider.getUserIdFromToken(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FarmerProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user"));

        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getMobileNumber(), user.getRole());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                tokenProvider.getAccessTokenExpirationMs(),
                user.getId(),
                user.getMobileNumber(),
                profile.getFullName(),
                profile.getPreferredLanguage(),
                profile.getVillage(),
                profile.getDistrict(),
                profile.getState(),
                user.getRole()
        );
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with mobile number: " + request.getMobileNumber()));

        // In production, send SMS OTP via SMS Gateway.
        // For development/testing, default OTP is 123456.
        return "OTP sent successfully to " + request.getMobileNumber() + ". (Use test OTP: 123456)";
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Verify OTP (allow test OTP 123456 or any 6-digit test code)
        if (!"123456".equals(request.getOtp()) && !request.getOtp().matches("^\\d{6}$")) {
            throw new BusinessException("Invalid OTP entered. Please try again.");
        }

        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with mobile number: " + request.getMobileNumber()));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
