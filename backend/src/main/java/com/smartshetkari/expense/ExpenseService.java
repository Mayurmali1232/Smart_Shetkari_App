package com.smartshetkari.expense;

import com.smartshetkari.expense.dto.TractorExpenseRequest;
import com.smartshetkari.expense.dto.TractorExpenseResponse;
import com.smartshetkari.tractor.Tractor;
import com.smartshetkari.tractor.TractorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final TractorExpenseRepository expenseRepository;
    private final TractorRepository tractorRepository;

    public ExpenseService(TractorExpenseRepository expenseRepository, TractorRepository tractorRepository) {
        this.expenseRepository = expenseRepository;
        this.tractorRepository = tractorRepository;
    }

    @Transactional
    public TractorExpenseResponse recordExpense(Long farmerId, TractorExpenseRequest request) {
        Tractor tractor = null;
        if (request.getTractorId() != null) {
            tractor = tractorRepository.findByIdAndFarmerId(request.getTractorId(), farmerId).orElse(null);
        }

        TractorExpense expense = new TractorExpense(
                farmerId,
                tractor,
                request.getCategory(),
                request.getAmount(),
                request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now(),
                request.getDescription(),
                request.getReceiptUrl()
        );

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    @Transactional(readOnly = true)
    public List<TractorExpenseResponse> listExpenses(Long farmerId, Long tractorId, TractorExpense.ExpenseCategory category) {
        List<TractorExpense> expenses;
        if (tractorId != null) {
            expenses = expenseRepository.findByFarmerIdAndTractorIdOrderByExpenseDateDesc(farmerId, tractorId);
        } else if (category != null) {
            expenses = expenseRepository.findByFarmerIdAndCategory(farmerId, category);
        } else {
            expenses = expenseRepository.findByFarmerIdOrderByExpenseDateDesc(farmerId);
        }

        return expenses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TractorExpenseResponse mapToResponse(TractorExpense e) {
        TractorExpenseResponse res = new TractorExpenseResponse();
        res.setId(e.getId());
        res.setFarmerId(e.getFarmerId());
        res.setTractorId(e.getTractor() != null ? e.getTractor().getId() : null);
        res.setTractorModel(e.getTractor() != null ? e.getTractor().getModelName() : "General Farm / Non-Tractor");
        res.setCategory(e.getCategory());
        res.setAmount(e.getAmount());
        res.setExpenseDate(e.getExpenseDate());
        res.setDescription(e.getDescription());
        res.setReceiptUrl(e.getReceiptUrl());
        res.setCreatedAt(e.getCreatedAt());
        return res;
    }
}
