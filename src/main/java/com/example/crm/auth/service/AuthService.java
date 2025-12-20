package com.example.crm.auth.service;

import com.example.crm.auth.dto.AuthResponse;
import com.example.crm.auth.dto.LoginRequest;
import com.example.crm.auth.dto.RegisterRequest;
import com.example.crm.common.exception.ValidationException;
import com.example.crm.organization.entity.Organization;
import com.example.crm.organization.repository.OrganizationRepository;
import com.example.crm.security.CustomUserDetailsService;
import com.example.crm.security.JwtUtil;
import com.example.crm.user.entity.Role;
import com.example.crm.user.entity.User;
import com.example.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        // Create or get organization
        Organization organization = organizationRepository.findByName(request.getOrganizationName())
                .orElseGet(() -> {
                    Organization newOrg = new Organization();
                    newOrg.setName(request.getOrganizationName());
                    return organizationRepository.save(newOrg);
                });

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(Role.SALES)); // Default role
        user.setOrganization(organization);
        
        user = userRepository.save(user);

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails, user.getTenantId());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRoles(), user.getTenantId());
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Load user details
        User user = userDetailsService.getUserByUsername(request.getUsername());
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // Generate JWT token
        String token = jwtUtil.generateToken(userDetails, user.getTenantId());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRoles(), user.getTenantId());
    }
}
