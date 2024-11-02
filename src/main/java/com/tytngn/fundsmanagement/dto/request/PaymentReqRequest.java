package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentReqRequest {
    @NotBlank(message = "DATA_INVALID")
    String description;

    @NotBlank(message = "DATA_INVALID")
    String fund;

    List<String> fileNames; // danh sách tên file ảnh
    List<byte[]> images;
}
