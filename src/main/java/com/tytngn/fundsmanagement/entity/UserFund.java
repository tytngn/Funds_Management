package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserFund {

    @EmbeddedId
    UserFundId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @MapsId("fundId")
    @JoinColumn(name = "fund_id")
    Fund fund;

    @Column(nullable = false)
    int status; // 0: không có quyền, 1: nhân viên có quyền đóng góp, 2: người quản lý có quyền rút quỹ
}
