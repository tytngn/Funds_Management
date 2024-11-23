package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column (length = 38)
    String id;

    @Column(nullable = false, length = 100)
    String name;

    @Column(nullable = false)
    int status; // 0: rút quỹ, 1: đóng góp quỹ

    // Relationships
    @OneToMany(mappedBy = "transactionType")
    Set<FundTransaction> fundTransactions = new HashSet<>();
}
