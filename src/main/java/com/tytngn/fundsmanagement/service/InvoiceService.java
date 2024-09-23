package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.InvoiceRequest;
import com.tytngn.fundsmanagement.dto.response.InvoiceResponse;
import com.tytngn.fundsmanagement.entity.Invoice;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.InvoiceMapper;
import com.tytngn.fundsmanagement.repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvoiceService {

    InvoiceRepository invoiceRepository;
    InvoiceMapper invoiceMapper;

    PaymentReqRepository paymentReqRepository;

    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {

        // đề nghị thanh toán
        var paymentReq = paymentReqRepository.findById(request.getPaymentReq()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // kiểm tra trạng thái của đề nghị thanh toán
        if(paymentReq.getStatus() != 1)
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);

        // tạo hoá đơn
        Invoice invoice = invoiceMapper.toInvoice(request);
        invoice.setCreateDate(LocalDateTime.now());
        invoice.setPaymentReq(paymentReq);

        // cập nhật tổng số tiền trong đề nghị thanh toán
        paymentReq.setAmount(paymentReq.getAmount() + request.getAmount());

        paymentReqRepository.save(paymentReq);
        invoice = invoiceRepository.save(invoice);

        return invoiceMapper.toInvoiceResponse(invoice);
    }

    public List<InvoiceResponse> getAll() {

        var invoices = invoiceRepository.findAll()
                .stream()
                .map(invoice -> invoiceMapper.toInvoiceResponse(invoice))
                .toList();

        return invoices;
    }

    @Transactional
    public InvoiceResponse update(String id, InvoiceRequest request) {

        // đề nghị thanh toán
        var paymentReq = paymentReqRepository.findById(request.getPaymentReq()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // kiểm tra trạng thái của đề nghị thanh toán
        if(paymentReq.getStatus() != 1)
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);

        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.INVOICE_NOT_EXISTS));

        // cập nhật hoá đơn
        invoiceMapper.updateInvoice(invoice, request);
        invoice.setUpdateDate(LocalDateTime.now());
        invoice.setPaymentReq(paymentReq);

        // cập nhật tổng số tiền trong đề nghị thanh toán
        paymentReq.setAmount(paymentReq.getAmount() + request.getAmount());

        paymentReqRepository.save(paymentReq);

        return invoiceMapper.toInvoiceResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public void delete(String id) {
        // tìm hoá đơn cần xoá
        var invoice = invoiceRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.INVOICE_NOT_EXISTS));

        var paymentReq = invoice.getPaymentReq();

        // kiểm tra trạng thái của đề nghị thanh toán
        if(paymentReq != null && paymentReq.getStatus() != 1)
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);

        // lấy danh sách các hóa đơn trong PaymentReq
        List<Invoice> invoices = invoiceRepository.findByPaymentReq(paymentReq);
        // Kiểm tra xem có phải hoá đơn cuối cùng hay không
        if(invoices.size() == 1)
            throw new AppException(ErrorCode.LAST_INVOICE_CANNOT_BE_DELETED);

        // Nếu không phải hoá đơn cuối cùng, cập nhật lại tổng số tiền ở PaymentReq và tiến hành xoá
        paymentReq.setAmount(paymentReq.getAmount() - invoice.getAmount());
        invoiceRepository.deleteById(id);

        // Cập nhật trạng thái của PaymentReq nếu vẫn còn hoá đơn khác
//        if (!invoices.isEmpty()) {
//            paymentReq.setStatus(1);  // Cập nhật trạng thái về 1
//            paymentReqRepository.save(paymentReq);
//        }
    }
}
