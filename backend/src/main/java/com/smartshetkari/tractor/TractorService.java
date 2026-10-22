package com.smartshetkari.tractor;

import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.tractor.dto.TractorRequest;
import com.smartshetkari.tractor.dto.TractorResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TractorService {

    private final TractorRepository tractorRepository;

    public TractorService(TractorRepository tractorRepository) {
        this.tractorRepository = tractorRepository;
    }

    @Transactional
    public TractorResponse createTractor(Long farmerId, TractorRequest request) {
        Tractor tractor = new Tractor(
                farmerId,
                request.getModelName(),
                request.getRegistrationNumber(),
                request.getOwnershipType(),
                request.getTractorType(),
                request.getDefaultHourlyRate(),
                request.getDefaultPerAcreRate(),
                request.getDefaultPerDayRate(),
                request.getAvailabilityStatus(),
                request.getNotes()
        );

        tractor = tractorRepository.save(tractor);
        return mapToResponse(tractor);
    }

    @Transactional
    public TractorResponse updateTractor(Long farmerId, Long tractorId, TractorRequest request) {
        Tractor tractor = tractorRepository.findByIdAndFarmerId(tractorId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tractor not found with ID: " + tractorId));

        tractor.setModelName(request.getModelName());
        tractor.setRegistrationNumber(request.getRegistrationNumber());
        if (request.getOwnershipType() != null) {
            tractor.setOwnershipType(request.getOwnershipType());
        }
        tractor.setTractorType(request.getTractorType());
        tractor.setDefaultHourlyRate(request.getDefaultHourlyRate());
        tractor.setDefaultPerAcreRate(request.getDefaultPerAcreRate());
        tractor.setDefaultPerDayRate(request.getDefaultPerDayRate());
        if (request.getAvailabilityStatus() != null) {
            tractor.setAvailabilityStatus(request.getAvailabilityStatus());
        }
        tractor.setNotes(request.getNotes());

        tractor = tractorRepository.save(tractor);
        return mapToResponse(tractor);
    }

    @Transactional(readOnly = true)
    public TractorResponse getTractorById(Long farmerId, Long tractorId) {
        Tractor tractor = tractorRepository.findByIdAndFarmerId(tractorId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tractor not found with ID: " + tractorId));

        return mapToResponse(tractor);
    }

    @Transactional(readOnly = true)
    public List<TractorResponse> listTractors(Long farmerId) {
        return tractorRepository.findByFarmerId(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TractorResponse updateStatus(Long farmerId, Long tractorId, Tractor.AvailabilityStatus status) {
        Tractor tractor = tractorRepository.findByIdAndFarmerId(tractorId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tractor not found with ID: " + tractorId));

        tractor.setAvailabilityStatus(status);
        tractor = tractorRepository.save(tractor);
        return mapToResponse(tractor);
    }

    public TractorResponse mapToResponse(Tractor tractor) {
        TractorResponse res = new TractorResponse();
        res.setId(tractor.getId());
        res.setFarmerId(tractor.getFarmerId());
        res.setModelName(tractor.getModelName());
        res.setRegistrationNumber(tractor.getRegistrationNumber());
        res.setOwnershipType(tractor.getOwnershipType());
        res.setTractorType(tractor.getTractorType());
        res.setDefaultHourlyRate(tractor.getDefaultHourlyRate());
        res.setDefaultPerAcreRate(tractor.getDefaultPerAcreRate());
        res.setDefaultPerDayRate(tractor.getDefaultPerDayRate());
        res.setAvailabilityStatus(tractor.getAvailabilityStatus());
        res.setNotes(tractor.getNotes());
        res.setCreatedAt(tractor.getCreatedAt());
        res.setUpdatedAt(tractor.getUpdatedAt());
        return res;
    }
}
