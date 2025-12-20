package com.example.crm.contact.service;

import com.example.crm.common.exception.ResourceNotFoundException;
import com.example.crm.contact.dto.ContactRequest;
import com.example.crm.contact.dto.ContactResponse;
import com.example.crm.contact.entity.Contact;
import com.example.crm.contact.repository.ContactRepository;
import com.example.crm.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;

    @Transactional
    public ContactResponse createContact(ContactRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        
        Contact contact = new Contact();
        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setCompany(request.getCompany());
        contact.setTenantId(tenantId);

        contact = contactRepository.save(contact);
        return mapToResponse(contact);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponse> getAllContacts(Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return contactRepository.findByTenantId(tenantId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ContactResponse getContactById(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        Contact contact = contactRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        return mapToResponse(contact);
    }

    @Transactional
    public ContactResponse updateContact(UUID id, ContactRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        Contact contact = contactRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setCompany(request.getCompany());

        contact = contactRepository.save(contact);
        return mapToResponse(contact);
    }

    @Transactional
    public void deleteContact(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        Contact contact = contactRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        contactRepository.delete(contact);
    }

    private ContactResponse mapToResponse(Contact contact) {
        ContactResponse response = new ContactResponse();
        response.setId(contact.getId());
        response.setFirstName(contact.getFirstName());
        response.setLastName(contact.getLastName());
        response.setEmail(contact.getEmail());
        response.setPhone(contact.getPhone());
        response.setCompany(contact.getCompany());
        response.setTenantId(contact.getTenantId());
        response.setCreatedAt(contact.getCreatedAt());
        response.setUpdatedAt(contact.getUpdatedAt());
        return response;
    }
}
