package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByIdAndRolesId(String id, String role);

    Optional<User> findByRoles_Id(String role);

    @Query("""
           SELECT u
            FROM User u 
            LEFT JOIN FETCH u.department d 
            LEFT JOIN FETCH u.roles r 
            LEFT JOIN FETCH u.funds f
            WHERE u.id = :id
                   """)
    Optional<User> findByIdFullInfo(@Param("id") String id);


    // Lấy danh sách người dùng theo các bộ lọc (theo thời gian, trạng thái, phòng ban, phân quyền, ngân hàng)
    @Query("SELECT u FROM User u " +
            "LEFT JOIN u.roles r " +
            "LEFT JOIN u.account a " +
            "WHERE (COALESCE(:start, null) IS NULL OR u.createdDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR u.createdDate <= :end) " +
            "AND (COALESCE(:status, -1) = -1 OR u.status = :status) " +
            "AND (COALESCE(:departmentId, '') = '' OR u.department.id = :departmentId) " +
            "AND (COALESCE(:roleId, '') = '' OR r.id = :roleId) " +
            "AND (COALESCE(:bankName, '') = '' OR a.bankName = :bankName)")
    List<User> filterUsers(@Param("start") LocalDate start,
                           @Param("end") LocalDate end,
                           @Param("status") Integer status,
                           @Param("departmentId") String departmentId,
                           @Param("roleId") String roleId,
                           @Param("bankName") String bankName);
}
