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
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column (length = 38)
    String id;

    @Column(nullable = false, unique = true, length = 30)
    String username;

    @Column(nullable = false)
    String password;

    @Column(nullable = false, unique = true)
    String email;

    @Column(nullable = false, length = 100)
    String fullname;

    @Column(length = 15)
    String phone;

    LocalDate dob;
    int gender; // 0: nam, 1: nữ, 2: khác

    @Column(nullable = false)
    int status = 1; // 0: vô hiệu hoá, 1: đang hoạt động

    @Column(nullable = false)
    LocalDate createdDate;

    LocalDate updatedDate;

    @Column(unique = true)
    Long telegramId;

    //Relationships
    @ManyToMany
    @JoinTable(name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    Set<Role> roles = new HashSet<>();

    @OneToOne(mappedBy = "user")
    BankAccount account;

    @OneToMany(mappedBy = "user")
    Set<PaymentReq> paymentReqs = new HashSet<>();

    @OneToMany(mappedBy = "user")
    Set<Fund> funds = new HashSet<>();

    @OneToMany(mappedBy = "user")
    Set<FundTransaction> fundTransactions = new HashSet<>();

    @OneToMany(mappedBy = "user")
    Set<BudgetEstimate> budgetEstimates = new HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department", referencedColumnName = "id", nullable = false)
    Department department;

}
