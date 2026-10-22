package com.smartshetkari.payment;

import com.smartshetkari.booking.BookingRepository;
import com.smartshetkari.booking.TractorBooking;
import com.smartshetkari.payment.dto.TractorPaymentRequest;
import com.smartshetkari.payment.dto.TractorPaymentResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final TractorPaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentService(TractorPaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public TractorPaymentResponse recordPayment(Long farmerId, TractorPaymentRequest request) {
        TractorBooking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findByIdAndFarmerId(request.getBookingId(), farmerId).orElse(null);
        }

        TractorPayment payment = new TractorPayment(
                farmerId,
                booking,
                request.getCustomerName(),
                request.getAmount(),
                request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now(),
                request.getPaymentMethod(),
                request.getNotes()
        );

        payment = paymentRepository.save(payment);
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<TractorPaymentResponse> listPayments(Long farmerId, Long bookingId) {
        List<TractorPayment> payments;
        if (bookingId != null) {
            payments = paymentRepository.findByFarmerIdAndBookingId(farmerId, bookingId);
        } else {
            payments = paymentRepository.findByFarmerIdOrderByPaymentDateDesc(farmerId);
        }

        return payments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TractorPaymentResponse mapToResponse(TractorPayment p) {
        TractorPaymentResponse res = new TractorPaymentResponse();
        res.setId(p.getId());
        res.setFarmerId(p.getFarmerId());
        res.setBookingId(p.getBooking() != null ? p.getBooking().getId() : null);
        res.setCustomerName(p.getCustomerName());
        res.setAmount(p.getAmount());
        res.setPaymentDate(p.getPaymentDate());
        res.setPaymentMethod(p.getPaymentMethod());
        res.setNotes(p.getNotes());
        res.setCreatedAt(p.getCreatedAt());
        return res;
    }
}
