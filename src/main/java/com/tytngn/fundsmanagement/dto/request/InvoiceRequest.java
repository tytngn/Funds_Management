package com.tytngn.fundsmanagement.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceRequest {

    @NotBlank(message = "BLANK_NAME")
    String name;

    @NotNull(message = "DATA_INVALID")
    @PositiveOrZero(message = "DATA_INVALID")
    double amount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime issuedDate;

    String description;

    String paymentReq;

    List<String> fileNames; // danh sách tên file ảnh

    List<byte[]> images;
}
