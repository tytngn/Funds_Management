package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

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
    @Column (length = 38)
    String id;

    @Column(nullable = false, length = 100)
    String name;

    @Column(nullable = false)
    double amount;

    LocalDateTime issuedDate; // ngay phat hanh hoa don

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(nullable = false)
    LocalDateTime createDate;
    LocalDateTime updateDate;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paymentReq", referencedColumnName = "id", nullable = false)
    PaymentReq paymentReq;

    // Thêm quan hệ với Image
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    List<Image> images;
}
