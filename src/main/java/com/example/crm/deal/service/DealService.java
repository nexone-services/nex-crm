package com.example.crm.deal.service;

import com.example.crm.common.exception.ResourceNotFoundException;
import com.example.crm.common.exception.TenantMismatchException;
import com.example.crm.contact.entity.Contact;
import com.example.crm.contact.repository.ContactRepository;
import com.example.crm.deal.dto.DealRequest;
import com.example.crm.deal.dto.DealResponse;
import com.example.crm.deal.entity.Deal;
import com.example.crm.deal.entity.DealStage;
import com.example.crm.deal.repository.DealRepository;
import com.example.crm.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final ContactRepository contactRepository;

    @Transactional
    public DealResponse createDeal(DealRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        
        Contact contact = contactRepository.findByIdAndTenantId(request.getContactId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        Deal deal = new Deal();
        deal.setName(request.getName());
        deal.setAmount(request.getAmount());
        deal.setStage(request.getStage() != null ? request.getStage() : DealStage.OPEN);
        deal.setContact(contact);
        deal.setTenantId(tenantId);

        deal = dealRepository.save(deal);
        return mapToResponse(deal);
    }

    @Transactional(readOnly = true)
    public Page<DealResponse> getAllDeals(Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        return dealRepository.findByTenantId(tenantId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public DealResponse getDealById(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        Deal deal = dealRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));
        return mapToResponse(deal);
    }

    @Transactional
    public DealResponse updateDeal(UUID id, DealRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        Deal deal = dealRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));

        deal.setName(request.getName());
        deal.setAmount(request.getAmount());
        
        if (request.getStage() != null) {
            deal.setStage(request.getStage());
        }

        if (request.getContactId() != null) {
            Contact contact = contactRepository.findByIdAndTenantId(request.getContactId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
            deal.setContact(contact);
        }

        deal = dealRepository.save(deal);
        return mapToResponse(deal);
    }

    @Transactional
    public void deleteDeal(UUID id) {
        UUID tenantId = TenantContext.getTenantId();
        Deal deal = dealRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));
        dealRepository.delete(deal);
    }

    private DealResponse mapToResponse(Deal deal) {
        DealResponse response = new DealResponse();
        response.setId(deal.getId());
        response.setName(deal.getName());
        response.setAmount(deal.getAmount());
        response.setStage(deal.getStage());
        response.setTenantId(deal.getTenantId());
        response.setCreatedAt(deal.getCreatedAt());
        response.setUpdatedAt(deal.getUpdatedAt());
        
        if (deal.getContact() != null) {
            response.setContactId(deal.getContact().getId());
            response.setContactName(deal.getContact().getFirstName() + " " + deal.getContact().getLastName());
        }
        
        return response;
    }
}
