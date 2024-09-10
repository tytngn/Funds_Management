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
    int status = 1;

    @Column(columnDefinition = "TEXT")
    String description;

    LocalDate createDate;

    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id",nullable = false)
    User user;

    @OneToMany(mappedBy = "fund")
    Set<FundTransaction> fundTransactions = new HashSet<>();
}
