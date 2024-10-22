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
public class BudgetEstimate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String title;

    @Column(nullable = false)
    double amount = 0.0;

    @Column(columnDefinition = "TEXT")
    String description;

    String fundName;

    @Column(nullable = false)
    int status = 1; // 0: từ chối, 1: chưa xử lý,  2: chờ duyệt, 3: đã duyệt

    LocalDate createdDate;
    LocalDate updatedDate;

    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fund_id", referencedColumnName = "id")
    Fund fund;

    @OneToMany(mappedBy = "budgetEstimate")
    Set<BudgetActivity> budgetActivities = new HashSet<>();

}
