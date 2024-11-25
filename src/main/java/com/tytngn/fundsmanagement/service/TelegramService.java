package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.dto.request.NotifyToAnUserRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TelegramService {
    WebClient webClient;

    // Gửi thông báo đến người dùng
    public void sendNotificationToAnUser(Long chatId, String message) {
        NotifyToAnUserRequest request = new NotifyToAnUserRequest(chatId, message);

        // Gửi yêu cầu POST bất đồng bộ
        webClient.post()
                .uri("http://localhost:8081/telegram/notify")
                .body(Mono.just(request), NotifyToAnUserRequest.class)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(unused -> log.warn("ĐÃ GỬI THÔNG BÁO"))
                .doOnError(error -> log.error("LỖI KHI GỬI THÔNG BÁO: {}", error.getMessage()))
                .subscribe();
    }

    // Gửi thông báo đến nhiều người dùng
//    public void sendNotificationToManyUsers(List<Long> ids, String message) {
//        NotifyToManyUsersRequest request = new NotifyToManyUsersRequest(ids, message);
//
//        webClient.post()
//                .uri("http://localhost:8081/telegram/notify/many-user")
//                .body(Mono.just(request), NotifyToManyUsersRequest.class)
//                .retrieve()
//                .bodyToMono(Void.class)
//                .doOnSuccess(unused -> log.warn("ĐÃ GỬI THÔNG BÁO"))
//                .doOnError(error -> log.error("LỖI KHI GỬI THÔNG BÁO: {}", error.getMessage()))
//                .subscribe();
//    }
}
