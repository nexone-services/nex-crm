package com.example.crm.contact.repository;

import com.example.crm.contact.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {
    Page<Contact> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<Contact> findByIdAndTenantId(UUID id, UUID tenantId);
}
