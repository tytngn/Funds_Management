package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageResponse {
    String id;
    String fileName;  // Tên file ảnh
    byte[] image;     // Dữ liệu ảnh
}
