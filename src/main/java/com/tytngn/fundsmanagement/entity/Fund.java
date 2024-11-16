package com.tytngn.fundsmanagement.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Fund {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String fundName;

    @Column(nullable = false)
    double balance = 0.0;

    @Column(nullable = false)
    int status = 1; // 0: ngưng hoạt động, 1: hoạt động

    @Column(columnDefinition = "TEXT")
    String description;

    LocalDate createDate;
    LocalDate updateDate;

    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id",nullable = false)
    User user;

    @OneToMany(mappedBy = "fund", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    Set<FundTransaction> fundTransactions = new HashSet<>();

    @OneToMany(mappedBy = "fund", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<FundPermission> fundPermissions = new HashSet<>();

    @OneToMany(mappedBy = "fund", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PaymentReq> paymentRequests = new HashSet<>();

    @OneToMany(mappedBy = "fund")
    Set<BudgetEstimate> budgetEstimates = new HashSet<>();
}
