package com.tytngn.fundsmanagement.configuration;

import com.tytngn.fundsmanagement.entity.Department;
import com.tytngn.fundsmanagement.entity.Role;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.repository.DepartmentRepository;
import com.tytngn.fundsmanagement.repository.RoleRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;

@Configuration
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {
    // Tạo user Admin

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    DepartmentRepository departmentRepository;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository){
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()){

                User user = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .email("admin@tytngn.com")
                        .fullname("admin")
                        .createdDate(LocalDate.now())
                        .status(9999)
                        .build();

                Optional<Role> optionalRole = roleRepository.findById("ADMIN");

                if (optionalRole.isPresent()){
                    Role role = optionalRole.get();
                    var roles = new HashSet<Role>();
                    roles.add(role);
                    user.setRoles(roles);
                }

                if(departmentRepository.existsById("f289ef6a-95aa-4956-b577-aef8ae11f397")){
                    Department department = Department.builder()
                            .id("f289ef6a-95aa-4956-b577-aef8ae11f397")
                            .name("Admin Department")
                            .build();
                    user.setDepartment(department);
                }

                userRepository.save(user);
                log.warn("admin user has been created with default password: admin, please change it");
            }
        };
    }

}
