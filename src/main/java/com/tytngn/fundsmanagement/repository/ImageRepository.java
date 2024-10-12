package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<Image, String> {
}
