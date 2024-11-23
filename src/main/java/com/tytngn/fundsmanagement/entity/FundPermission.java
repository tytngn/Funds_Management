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
public class FundPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column (length = 38)
    String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fund_id", referencedColumnName = "id", nullable = false)
    Fund fund;

    @Column(nullable = false)
    boolean canContribute = false; // quyền đóng góp

    @Column(nullable = false)
    boolean canWithdraw = false; // quyền rút quỹ

    @Column(nullable = false)
    LocalDate grantedDate; // ngày thêm quyền giao dịch
}
