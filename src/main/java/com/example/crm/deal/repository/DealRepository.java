package com.example.crm.deal.repository;

import com.example.crm.deal.entity.Deal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealRepository extends JpaRepository<Deal, UUID> {
    Page<Deal> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<Deal> findByIdAndTenantId(UUID id, UUID tenantId);
}
