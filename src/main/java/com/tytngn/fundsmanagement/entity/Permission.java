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
public class Permission {
    @Id
    String id;

    @Column(nullable = false, length = 50)
    String perm_name;

    //Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "functions_id", nullable = false)
    Functions functions;

    @ManyToMany(mappedBy = "permissions")
    Set<Role> roles = new HashSet<>();
}
