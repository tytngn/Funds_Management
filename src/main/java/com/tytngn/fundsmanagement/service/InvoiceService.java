package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.InvoiceRequest;
import com.tytngn.fundsmanagement.dto.response.InvoiceResponse;
import com.tytngn.fundsmanagement.entity.Image;
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

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvoiceService {

    InvoiceRepository invoiceRepository;
    InvoiceMapper invoiceMapper;

    PaymentReqRepository paymentReqRepository;
    ImageRepository imageRepository;

    // Tạo hoá đơn
    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {

        // đề nghị thanh toán
        var paymentReq = paymentReqRepository.findById(request.getPaymentReq()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // Kiểm tra trạng thái của đề nghị thanh toán (chỉ cho phép nếu trạng thái là 0 hoặc 1)
        if (paymentReq.getStatus() != 0 && paymentReq.getStatus() != 1) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);
        }

        // Nếu trạng thái là 0, kiểm tra số lần cập nhật trước đó
        if (paymentReq.getStatus() == 0) {
            int updateCount = paymentReq.getRequestCount();
            if (updateCount > 3) {
                throw new AppException(ErrorCode.PAYMENT_REQUEST_UPDATE_LIMIT_EXCEEDED);
            }
        }

        // tạo hoá đơn
        Invoice invoice = invoiceMapper.toInvoice(request);
        invoice.setCreateDate(LocalDateTime.now());
        invoice.setPaymentReq(paymentReq);

        // Tải lên nhiều ảnh minh chứng
        List<Image> savedImages = new ArrayList<>();
        for (int i = 0; i < request.getImages().size(); i++) {
            byte[] file = request.getImages().get(i);
            String fileName = request.getFileNames().get(i);  // Lấy tên file tương ứng

            Image image = new Image();
            image.setImage(file); // Lưu dữ liệu ảnh dưới dạng byte[]
            image.setFileName(fileName); // Lưu tên file ảnh
            savedImages.add(imageRepository.save(image));
        }
        invoice.setImages(savedImages);

        // cập nhật tổng số tiền trong đề nghị thanh toán và trạng thái
        paymentReq.setAmount(paymentReq.getAmount() + request.getAmount());
        paymentReq.setStatus(1);

        paymentReqRepository.save(paymentReq);
        invoice = invoiceRepository.save(invoice);

        return invoiceMapper.toInvoiceResponse(invoice);
    }

    // Lấy danh sách tất cả các hoá đơn
    public List<InvoiceResponse> getAll() {

        var invoices = invoiceRepository.findAll()
                .stream()
                .map(invoice -> invoiceMapper.toInvoiceResponse(invoice))
                .toList();

        return invoices;
    }

    // Lấy danh sách các hoá đơn của 1 đề nghị thanh toán
    public List<InvoiceResponse> getInvoicesByPaymentReq(String paymentReqId) {
        // Tìm đề nghị thanh toán dựa trên ID
        var paymentReq = paymentReqRepository.findById(paymentReqId).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // Lấy danh sách hóa đơn từ đề nghị thanh toán
        List<Invoice> invoices = invoiceRepository.findByPaymentReq(paymentReq);

        return invoices.stream()
                .map(invoiceMapper::toInvoiceResponse)
                .sorted(Comparator.comparing(InvoiceResponse::getCreateDate).reversed())
                .toList();
    }

    // Lấy thông tin hoá đơn theo Id
    public InvoiceResponse getById(String id) {
        return invoiceMapper.toInvoiceResponse(invoiceRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.INVOICE_NOT_EXISTS)));
    }

    // Cập nhật hoá đơn
    @Transactional
    public InvoiceResponse update(String id, InvoiceRequest request) {

        // đề nghị thanh toán
        var paymentReq = paymentReqRepository.findById(request.getPaymentReq()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // Kiểm tra trạng thái của đề nghị thanh toán (chỉ cho phép nếu trạng thái là 0 hoặc 1)
        if (paymentReq.getStatus() != 0 && paymentReq.getStatus() != 1) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);
        }

        // Nếu trạng thái là 0, kiểm tra số lần cập nhật trước đó
        if (paymentReq.getStatus() == 0) {
            int updateCount = paymentReq.getRequestCount();
            if (updateCount > 3) {
                throw new AppException(ErrorCode.PAYMENT_REQUEST_UPDATE_LIMIT_EXCEEDED);
            }
        }

        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.INVOICE_NOT_EXISTS));

        // Trừ số tiền cũ của hóa đơn từ tổng số tiền trong đề nghị thanh toán
        paymentReq.setAmount(paymentReq.getAmount() - invoice.getAmount());

        // cập nhật hoá đơn
        invoiceMapper.updateInvoice(invoice, request);
        invoice.setUpdateDate(LocalDateTime.now());
        invoice.setPaymentReq(paymentReq);

        // Tải lên nhiều ảnh minh chứng
        List<Image> savedImages = new ArrayList<>();
        for (int i = 0; i < request.getImages().size(); i++) {
            byte[] file = request.getImages().get(i);
            String fileName = request.getFileNames().get(i);  // Lấy tên file tương ứng

            Image image = new Image();
            image.setImage(file); // Lưu dữ liệu ảnh dưới dạng byte[]
            image.setFileName(fileName); // Lưu tên file ảnh
            savedImages.add(imageRepository.save(image));
        }
        invoice.setImages(savedImages);

        // cập nhật tổng số tiền trong đề nghị thanh toán và trạng thái
        paymentReq.setAmount(paymentReq.getAmount() + request.getAmount());
        paymentReq.setStatus(1);

        paymentReqRepository.save(paymentReq);

        return invoiceMapper.toInvoiceResponse(invoiceRepository.save(invoice));
    }

    // Xoá hoá đơn
    @Transactional
    public void delete(String id) {
        // tìm hoá đơn cần xoá
        var invoice = invoiceRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.INVOICE_NOT_EXISTS));

        var paymentReq = invoice.getPaymentReq();

        // Kiểm tra trạng thái của đề nghị thanh toán (chỉ cho phép nếu trạng thái là 0 hoặc 1)
        if (paymentReq.getStatus() != 0 && paymentReq.getStatus() != 1) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);
        }

        // Nếu trạng thái là 0, kiểm tra số lần cập nhật trước đó
        if (paymentReq.getStatus() == 0) {
            int updateCount = paymentReq.getRequestCount();
            if (updateCount > 3) {
                throw new AppException(ErrorCode.PAYMENT_REQUEST_UPDATE_LIMIT_EXCEEDED);
            }
        }

        // cập nhật lại tổng số tiền ở PaymentReq và tiến hành xoá
        paymentReq.setAmount(paymentReq.getAmount() - invoice.getAmount());
        paymentReq.setStatus(1);
        paymentReqRepository.save(paymentReq);
        invoiceRepository.deleteById(id);
    }
}
