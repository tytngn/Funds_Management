package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
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

    @Column(columnDefinition = "TEXT")
    String description;

    String fundName;

    @Column(nullable = false)
    int status = 1; // 0: từ chối, 1: chưa xử lý,  2: chờ duyệt, 3: đã duyệt

    LocalDateTime createdDate;
    LocalDateTime updatedDate;

    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fund_id", referencedColumnName = "id", nullable = false)
    Fund fund;

    @OneToMany(mappedBy = "budgetEstimate")
    Set<BudgetActivity> budgetActivities = new HashSet<>();

}
