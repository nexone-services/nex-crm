package com.example.crm.lead.service;

import com.example.crm.common.exception.ResourceNotFoundException;
import com.example.crm.common.exception.TenantMismatchException;
import com.example.crm.contact.entity.Contact;
import com.example.crm.contact.repository.ContactRepository;
import com.example.crm.lead.dto.AssignLeadRequest;
import com.example.crm.lead.dto.LeadRequest;
import com.example.crm.lead.dto.LeadResponse;
import com.example.crm.lead.entity.Lead;
import com.example.crm.lead.entity.LeadStatus;
import com.example.crm.lead.repository.LeadRepository;
import com.example.crm.tenant.TenantContext;
import com.example.crm.user.entity.User;
import com.example.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;

    @Transactional
    public LeadResponse createLead(LeadRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        
        Lead lead = new Lead();
        lead.setFirstName(request.getFirstName());
        lead.setLastName(request.getLastName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setCompany(request.getCompany());
        lead.setStatus(request.getStatus() != null ? request.getStatus() : LeadStatus.NEW);
        lead.setTenantId(tenantId);

        if (request.getAssignedToId() != null) {
            User user = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            if (!user.getTenantId().equals(tenantId)) {
                throw new TenantMismatchException("Cannot assign lead to user from different organization");
            }
            lead.setAssignedTo(user);
        }

        lead = leadRepository.save(lead);
        return mapToResponse(lead);
    }

    @Transactional(readOnly = true)
    public Page<LeadResponse> getAllLeads(Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return leadRepository.findByTenantId(tenantId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        return mapToResponse(lead);
    }

    @Transactional
    public LeadResponse updateLead(UUID id, LeadRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        lead.setFirstName(request.getFirstName());
        lead.setLastName(request.getLastName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setCompany(request.getCompany());
        
        if (request.getStatus() != null) {
            lead.setStatus(request.getStatus());
        }

        if (request.getAssignedToId() != null) {
            User user = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            if (!user.getTenantId().equals(tenantId)) {
                throw new TenantMismatchException("Cannot assign lead to user from different organization");
            }
            lead.setAssignedTo(user);
        }

        lead = leadRepository.save(lead);
        return mapToResponse(lead);
    }

    @Transactional
    public void deleteLead(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        leadRepository.delete(lead);
    }

    @Transactional
    public LeadResponse assignLead(UUID id, AssignLeadRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getTenantId().equals(tenantId)) {
            throw new TenantMismatchException("Cannot assign lead to user from different organization");
        }

        lead.setAssignedTo(user);
        lead = leadRepository.save(lead);
        return mapToResponse(lead);
    }

    @Transactional
    public UUID convertLeadToContact(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        // Create contact from lead
        Contact contact = new Contact();
        contact.setFirstName(lead.getFirstName());
        contact.setLastName(lead.getLastName());
        contact.setEmail(lead.getEmail());
        contact.setPhone(lead.getPhone());
        contact.setCompany(lead.getCompany());
        contact.setTenantId(tenantId);

        contact = contactRepository.save(contact);

        // Update lead status
        lead.setStatus(LeadStatus.CONVERTED);
        leadRepository.save(lead);

        return contact.getId();
    }

    private LeadResponse mapToResponse(Lead lead) {
        LeadResponse response = new LeadResponse();
        response.setId(lead.getId());
        response.setFirstName(lead.getFirstName());
        response.setLastName(lead.getLastName());
        response.setEmail(lead.getEmail());
        response.setPhone(lead.getPhone());
        response.setCompany(lead.getCompany());
        response.setStatus(lead.getStatus());
        response.setTenantId(lead.getTenantId());
        response.setCreatedAt(lead.getCreatedAt());
        response.setUpdatedAt(lead.getUpdatedAt());
        
        if (lead.getAssignedTo() != null) {
            response.setAssignedToId(lead.getAssignedTo().getId());
            response.setAssignedToUsername(lead.getAssignedTo().getUsername());
        }
        
        return response;
    }
}
