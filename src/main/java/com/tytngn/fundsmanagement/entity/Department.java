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
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column (length = 38)
    String id;

    @Column(nullable = false, length = 100)
    String name;

    // Relationships
    @OneToMany(mappedBy = "department")
    Set<User> users = new HashSet<>();
}
