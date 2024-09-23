package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BudgetActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String name;

    LocalDate activityDate;

    @Column(nullable = false)
    double amount = 0.0;

    @Column(nullable = false)
    int status = 0; // 0: chưa thực hiện, 1: hoàn thành

    @Column(length = 50)
    String unit;

    float quantity = 0.0f;

    @Column(columnDefinition = "TEXT")
    String description;

    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "be_id", referencedColumnName = "id", nullable = false)
    BudgetEstimate budgetEstimate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "paymentReq_id", referencedColumnName = "id")
    PaymentReq paymentReq;
}
