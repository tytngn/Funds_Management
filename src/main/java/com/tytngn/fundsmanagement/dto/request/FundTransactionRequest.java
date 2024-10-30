package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundTransactionRequest {

    @NotNull(message = "DATA_INVALID")
    @PositiveOrZero(message = "DATA_INVALID")
    double amount;

    @NotNull(message = "DATA_INVALID")
    String description;

    String fund;
    String transactionType;

    List<String> fileNames; // danh sách tên file ảnh
    List<byte[]> images;
}
