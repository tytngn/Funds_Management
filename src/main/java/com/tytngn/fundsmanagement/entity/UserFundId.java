package com.tytngn.fundsmanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserFundId implements Serializable {

    @Column(name = "user_id")
    String userId;

    @Column(name = "fund_id")
    String fundId;
}
