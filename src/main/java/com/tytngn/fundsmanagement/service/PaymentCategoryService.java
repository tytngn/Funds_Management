package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.PaymentCategoryRequest;
import com.tytngn.fundsmanagement.dto.response.PaymentCategoryResponse;
import com.tytngn.fundsmanagement.entity.PaymentCategory;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.PaymentCategoryMapper;
import com.tytngn.fundsmanagement.repository.PaymentCategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentCategoryService {

    PaymentCategoryRepository paymentCategoryRepository;
    PaymentCategoryMapper paymentCategoryMapper;

    public PaymentCategoryResponse create(PaymentCategoryRequest request) {

        PaymentCategory paymentCategory = paymentCategoryMapper.toPaymentCategory(request);

        if (paymentCategoryRepository.existsByName(request.getName())){
            throw new AppException(ErrorCode.PAYMENT_CATEGORY_EXISTS);
        }
        paymentCategory = paymentCategoryRepository.save(paymentCategory);

        return paymentCategoryMapper.toPaymentCategoryResponse(paymentCategory);
    }

    public List<PaymentCategoryResponse> getAll() {

        var paymentCategory = paymentCategoryRepository.findAll()
                .stream()
                .map(type -> paymentCategoryMapper.toPaymentCategoryResponse(type))
                .toList();

        return paymentCategory;
    }

    public PaymentCategoryResponse update(String id, PaymentCategoryRequest request) {
        PaymentCategory paymentCategory = paymentCategoryRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));

        paymentCategoryMapper.updatePaymentCategory(paymentCategory, request);
        return paymentCategoryMapper.toPaymentCategoryResponse(paymentCategoryRepository.save(paymentCategory));
    }

    public void delete(String id) {
        paymentCategoryRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));

        paymentCategoryRepository.deleteById(id);
    }
}
