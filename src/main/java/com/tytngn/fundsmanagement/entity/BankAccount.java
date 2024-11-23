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
public class BankAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column (length = 38)
    String id;

    @Column(nullable = false, length = 100)
    String bankName;

    @Column(nullable = false, length = 30)
    String accountNumber;

    @Column(nullable = false)
    LocalDate createdDate;

    // Relationships
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    User user;

}
