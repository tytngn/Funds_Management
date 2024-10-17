package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String fileName;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    byte[] image;
}
