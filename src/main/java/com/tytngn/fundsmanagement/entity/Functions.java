package com.tytngn.fundsmanagement.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
public class Functions {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    // Relationships
    @OneToMany(mappedBy = "functions")
    @JsonManagedReference
    private Set<Permission> permissions = new HashSet<>();
}
