package com.smartshetkari.booking;

import com.smartshetkari.booking.dto.BookingRequest;
import com.smartshetkari.booking.dto.BookingResponse;
import com.smartshetkari.booking.dto.CompleteWorkRequest;
import com.smartshetkari.common.BusinessException;
import com.smartshetkari.common.ResourceNotFoundException;
import com.smartshetkari.payment.TractorPaymentRepository;
import com.smartshetkari.tractor.Tractor;
import com.smartshetkari.tractor.TractorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final WorkLogRepository workLogRepository;
    private final TractorRepository tractorRepository;
    private final TractorPaymentRepository tractorPaymentRepository;

    public BookingService(BookingRepository bookingRepository,
                          WorkLogRepository workLogRepository,
                          TractorRepository tractorRepository,
                          TractorPaymentRepository tractorPaymentRepository) {
        this.bookingRepository = bookingRepository;
        this.workLogRepository = workLogRepository;
        this.tractorRepository = tractorRepository;
        this.tractorPaymentRepository = tractorPaymentRepository;
    }

    @Transactional
    public BookingResponse createBooking(Long farmerId, BookingRequest request) {
        Tractor tractor = tractorRepository.findByIdAndFarmerId(request.getTractorId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tractor not found with ID: " + request.getTractorId()));

        if (request.getStatus() == TractorBooking.BookingStatus.CONFIRMED || request.getStatus() == TractorBooking.BookingStatus.IN_PROGRESS) {
            validateNoOverlap(farmerId, tractor.getId(), request.getWorkDate(), request.getStartTime(), request.getEndTime(), null);
        }

        TractorBooking booking = new TractorBooking(
                farmerId,
                tractor,
                request.getCustomerName(),
                request.getCustomerMobile(),
                request.getWorkDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getWorkLocation(),
                request.getWorkType(),
                request.getEstimatedArea(),
                request.getAgreedRate(),
                request.getFinalAgreedAmount(),
                request.getStatus(),
                request.getNotes()
        );
        booking.setCustomWorkType(request.getCustomWorkType());

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse updateBooking(Long farmerId, Long bookingId, BookingRequest request) {
        TractorBooking booking = bookingRepository.findByIdAndFarmerId(bookingId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        Tractor tractor = tractorRepository.findByIdAndFarmerId(request.getTractorId(), farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tractor not found with ID: " + request.getTractorId()));

        if (request.getStatus() == TractorBooking.BookingStatus.CONFIRMED || request.getStatus() == TractorBooking.BookingStatus.IN_PROGRESS) {
            validateNoOverlap(farmerId, tractor.getId(), request.getWorkDate(), request.getStartTime(), request.getEndTime(), bookingId);
        }

        booking.setTractor(tractor);
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerMobile(request.getCustomerMobile());
        booking.setWorkDate(request.getWorkDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setWorkLocation(request.getWorkLocation());
        booking.setWorkType(request.getWorkType());
        booking.setCustomWorkType(request.getCustomWorkType());
        booking.setEstimatedArea(request.getEstimatedArea());
        booking.setAgreedRate(request.getAgreedRate());
        booking.setFinalAgreedAmount(request.getFinalAgreedAmount());
        booking.setStatus(request.getStatus());
        booking.setNotes(request.getNotes());

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse updateStatus(Long farmerId, Long bookingId, TractorBooking.BookingStatus status) {
        TractorBooking booking = bookingRepository.findByIdAndFarmerId(bookingId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (status == TractorBooking.BookingStatus.CONFIRMED || status == TractorBooking.BookingStatus.IN_PROGRESS) {
            validateNoOverlap(farmerId, booking.getTractor().getId(), booking.getWorkDate(), booking.getStartTime(), booking.getEndTime(), bookingId);
        }

        booking.setStatus(status);
        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse completeWork(Long farmerId, Long bookingId, CompleteWorkRequest request) {
        TractorBooking booking = bookingRepository.findByIdAndFarmerId(bookingId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        booking.setStatus(TractorBooking.BookingStatus.COMPLETED);
        if (request.getFinalAgreedAmount() != null) {
            booking.setFinalAgreedAmount(request.getFinalAgreedAmount());
        }
        booking = bookingRepository.save(booking);

        Optional<TractorWorkLog> existingLogOpt = workLogRepository.findByBookingId(bookingId);
        TractorWorkLog workLog;
        if (existingLogOpt.isPresent()) {
            workLog = existingLogOpt.get();
            workLog.setActualHours(request.getActualHours());
            workLog.setActualAreaAcres(request.getActualAreaAcres());
            workLog.setWorkSummary(request.getWorkSummary());
            if (request.getCompletedDate() != null) {
                workLog.setCompletedDate(request.getCompletedDate());
            }
        } else {
            workLog = new TractorWorkLog(
                    booking,
                    farmerId,
                    request.getActualHours(),
                    request.getActualAreaAcres(),
                    request.getWorkSummary(),
                    request.getCompletedDate() != null ? request.getCompletedDate() : LocalDate.now()
            );
        }
        workLogRepository.save(workLog);

        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listBookings(Long farmerId, TractorBooking.BookingStatus status, Long tractorId) {
        List<TractorBooking> bookings;
        if (status != null) {
            bookings = bookingRepository.findByFarmerIdAndStatusOrderByWorkDateDesc(farmerId, status);
        } else if (tractorId != null) {
            bookings = bookingRepository.findByFarmerIdAndTractorIdOrderByWorkDateDesc(farmerId, tractorId);
        } else {
            bookings = bookingRepository.findByFarmerIdOrderByWorkDateDesc(farmerId);
        }

        return bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long farmerId, Long bookingId) {
        TractorBooking booking = bookingRepository.findByIdAndFarmerId(bookingId, farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        return mapToResponse(booking);
    }

    private void validateNoOverlap(Long farmerId, Long tractorId, LocalDate workDate,
                                  java.time.LocalTime startTime, java.time.LocalTime endTime, Long excludeId) {
        long overlapCount = bookingRepository.countOverlappingConfirmedBookings(
                farmerId, tractorId, workDate, startTime, endTime, excludeId
        );
        if (overlapCount > 0) {
            throw new BusinessException("Overlap conflict: This tractor already has a confirmed booking for the specified date and time.");
        }
    }

    private BookingResponse mapToResponse(TractorBooking b) {
        BookingResponse res = new BookingResponse();
        res.setId(b.getId());
        res.setFarmerId(b.getFarmerId());
        res.setTractorId(b.getTractor().getId());
        res.setTractorModel(b.getTractor().getModelName());
        res.setRegistrationNumber(b.getTractor().getRegistrationNumber());
        res.setCustomerName(b.getCustomerName());
        res.setCustomerMobile(b.getCustomerMobile());
        res.setWorkDate(b.getWorkDate());
        res.setStartTime(b.getStartTime());
        res.setEndTime(b.getEndTime());
        res.setWorkLocation(b.getWorkLocation());
        res.setWorkType(b.getWorkType());
        res.setCustomWorkType(b.getCustomWorkType());
        res.setEstimatedArea(b.getEstimatedArea());
        res.setAgreedRate(b.getAgreedRate());
        res.setFinalAgreedAmount(b.getFinalAgreedAmount());
        res.setStatus(b.getStatus());
        res.setNotes(b.getNotes());
        res.setCreatedAt(b.getCreatedAt());

        // Attach actual work log if completed
        workLogRepository.findByBookingId(b.getId()).ifPresent(log -> {
            res.setActualHours(log.getActualHours());
            res.setActualAreaAcres(log.getActualAreaAcres());
            res.setWorkSummary(log.getWorkSummary());
            res.setCompletedDate(log.getCompletedDate());
        });

        // Financial balances
        BigDecimal received = tractorPaymentRepository.sumPaidByBookingId(b.getFarmerId(), b.getId());
        res.setTotalReceived(received);
        res.setOutstandingBalance(b.getFinalAgreedAmount().subtract(received));

        return res;
    }
}
