package com.tytngn.fundsmanagement.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 50)
    private String perm_name;

    @Column(columnDefinition = "TEXT")
    private String description;

    //Relationships
    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "functions_id", nullable = false)
    private Functions functions;

    @ManyToMany(mappedBy = "permissions")
    private Set<Role> roles = new HashSet<>();
}
