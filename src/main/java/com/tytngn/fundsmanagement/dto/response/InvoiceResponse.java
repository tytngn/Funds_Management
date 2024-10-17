package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceResponse {
    String id;
    String name;
    double amount;
    LocalDateTime issuedDate;
    String description;
    LocalDateTime createDate;
    LocalDateTime updateDate;
    List<ImageResponse> images;
}
