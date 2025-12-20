package com.example.crm.lead.repository;

import com.example.crm.lead.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    Page<Lead> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<Lead> findByIdAndTenantId(UUID id, UUID tenantId);
}
