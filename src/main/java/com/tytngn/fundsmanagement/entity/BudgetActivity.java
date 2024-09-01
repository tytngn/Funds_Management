package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class BudgetActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String activityName;

    private LocalDate activityDate;

    @Column(nullable = false)
    private double amount = 0.0;

    @Column(nullable = false)
    private int status = 0;

    @Column(nullable = false, length = 50)
    private String unit;

    @Column(nullable = false)
    private float quantity = 0.0f;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "be_id", referencedColumnName = "id", nullable = false)
    private BudgetEstimate budgetEstimate;
}
