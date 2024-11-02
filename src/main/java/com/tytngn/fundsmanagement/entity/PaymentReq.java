package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentReq {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    double amount = 0.0;

    @Column(nullable = false)
    int status = 1; // 0: từ chối, 1: chưa xử lý, 2: chờ duyệt, 3: đã duyệt, 4: đã thanh toán, 5: đã nhận

    @Column(columnDefinition = "TEXT")
    String description;

    LocalDateTime createDate;
    LocalDateTime updateDate;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fund_id", referencedColumnName = "id", nullable = false)
    Fund fund;

    @OneToMany(mappedBy = "paymentReq", cascade = CascadeType.ALL)
    Set<Invoice> invoices = new HashSet<>();

    // Thêm quan hệ với Image
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    List<Image> images;

    //    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "category_id", referencedColumnName = "id", nullable = false)
//    PaymentCategory category;

    //    @OneToMany(mappedBy = "paymentReq")
//    Set<BudgetActivity> budgetActivities = new HashSet<>();
}
