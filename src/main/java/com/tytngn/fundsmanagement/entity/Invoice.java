package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    double amount;

    LocalDateTime issuedDate; // ngay phat hanh hoa don

    @Column(columnDefinition = "TEXT")
    String description;

    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    byte[] proofImage;

    LocalDateTime createDate;
    LocalDateTime updateDate;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paymentReq", referencedColumnName = "id", nullable = false)
    PaymentReq paymentReq;
}
