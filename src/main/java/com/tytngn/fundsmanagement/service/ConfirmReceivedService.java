package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.entity.PaymentReq;
import com.tytngn.fundsmanagement.repository.PaymentReqRepository;
import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConfirmReceivedService {
    PaymentReqRepository paymentReqRepository;

    List<PaymentReq> paymentReqList = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void loadPaymentReqList() {
        paymentReqList.clear();
        paymentReqList.addAll(paymentReqRepository.findAllByStatus(4));
    }

    public void refreshPaymentReqList() {
        paymentReqList.clear();
        paymentReqList.addAll(paymentReqRepository.findAllByStatus(4));
        log.info("\n\n\nREFRESH PAYMENT REQUEST LIST");
    }

    @Scheduled(fixedRate = 60000)
    public void checkListPaymentReqs() {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);

        for (PaymentReq paymentReq : paymentReqList) {
            LocalDateTime updateDate = paymentReq.getUpdateDate().truncatedTo(ChronoUnit.MINUTES);
            if (updateDate.plusMinutes(4320).isBefore(now)) {
                paymentReq.setStatus(5);
                paymentReq.setUpdateDate(LocalDateTime.now());
                paymentReqRepository.save(paymentReq);
                paymentReqList.remove(paymentReq);
                log.warn("\n\nTrạng thái đề nghị thanh toán đã được cập nhật");
            }
        }
    }
}
