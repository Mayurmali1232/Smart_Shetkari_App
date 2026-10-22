package com.smartshetkari.user;

import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.user.dto.ChangeLanguageRequest;
import com.smartshetkari.user.dto.ProfileResponse;
import com.smartshetkari.user.dto.UpdateProfileRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository profileRepository;

    public UserService(UserRepository userRepository, FarmerProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        FarmerProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        return new ProfileResponse(
                user.getId(),
                user.getMobileNumber(),
                user.getEmail(),
                profile.getFullName(),
                profile.getVillage(),
                profile.getDistrict(),
                profile.getState(),
                profile.getPreferredLanguage(),
                profile.getCurrency()
        );
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        FarmerProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        profile.setFullName(request.getFullName());
        profile.setVillage(request.getVillage());
        profile.setDistrict(request.getDistrict());
        profile.setState(request.getState());
        if (request.getCurrency() != null && !request.getCurrency().trim().isEmpty()) {
            profile.setCurrency(request.getCurrency().trim());
        }

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail().trim());
            userRepository.save(user);
        }

        profile = profileRepository.save(profile);

        return new ProfileResponse(
                user.getId(),
                user.getMobileNumber(),
                user.getEmail(),
                profile.getFullName(),
                profile.getVillage(),
                profile.getDistrict(),
                profile.getState(),
                profile.getPreferredLanguage(),
                profile.getCurrency()
        );
    }

    @Transactional
    public ProfileResponse updateLanguage(Long userId, ChangeLanguageRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        FarmerProfile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        profile.setPreferredLanguage(request.getLanguage());
        profile = profileRepository.save(profile);

        return new ProfileResponse(
                user.getId(),
                user.getMobileNumber(),
                user.getEmail(),
                profile.getFullName(),
                profile.getVillage(),
                profile.getDistrict(),
                profile.getState(),
                profile.getPreferredLanguage(),
                profile.getCurrency()
        );
    }
}
