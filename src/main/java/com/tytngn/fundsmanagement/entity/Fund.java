package com.tytngn.fundsmanagement.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Fund {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String fundName;

    @Column(nullable = false)
    private double balance = 0.0;

    @Column(nullable = false)
    private int status = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate createDate;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id",nullable = false)
    private User user;

    @OneToMany(mappedBy = "fund")
    private Set<FundTransaction> fundTransactions = new HashSet<>();

    @OneToMany(mappedBy = "fund")
    private Set<Contribution> contributions = new HashSet<>();
}
