package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    @Query(value = """
                SELECT r.id, r.role_name
                FROM Role r
                JOIN user_role ur ON r.id = ur.role_id
                JOIN User u ON ur.user_id = u.id
                WHERE user_id = :userId
                """, nativeQuery = true)
    Set<Role> findByUserId(@Param("userId") String userId);

    @Query(value = """ 
        SELECT IF (COUNT(rp.role_id) > 0, 'true', 'false')
          FROM role_permission rp
          WHERE rp.role_id IN :roleIds
          AND rp.perm_id IN :permissionIds
        """, nativeQuery = true)
    Boolean existsByRoleIdsAndPermissionIds (@Param("roleIds") List<String> roleIds,
                                             @Param("permissionIds") List<String> permissionIds);
}
