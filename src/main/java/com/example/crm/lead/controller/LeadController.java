package com.example.crm.lead.controller;

import com.example.crm.lead.dto.AssignLeadRequest;
import com.example.crm.lead.dto.LeadRequest;
import com.example.crm.lead.dto.LeadResponse;
import com.example.crm.lead.service.LeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
@Tag(name = "Leads", description = "Lead management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class LeadController {

    private final LeadService leadService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Create a new lead", description = "Create a new lead in the CRM")
    public ResponseEntity<LeadResponse> createLead(@Valid @RequestBody LeadRequest request) {
        LeadResponse response = leadService.createLead(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES', 'VIEWER')")
    @Operation(summary = "Get all leads", description = "Get all leads with pagination and sorting")
    public ResponseEntity<Page<LeadResponse>> getAllLeads(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<LeadResponse> leads = leadService.getAllLeads(pageable);
        return ResponseEntity.ok(leads);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES', 'VIEWER')")
    @Operation(summary = "Get lead by ID", description = "Get a specific lead by ID")
    public ResponseEntity<LeadResponse> getLeadById(@PathVariable UUID id) {
        LeadResponse response = leadService.getLeadById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Update lead", description = "Update an existing lead")
    public ResponseEntity<LeadResponse> updateLead(
            @PathVariable UUID id,
            @Valid @RequestBody LeadRequest request) {
        LeadResponse response = leadService.updateLead(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete lead", description = "Delete a lead")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Assign lead", description = "Assign a lead to a user")
    public ResponseEntity<LeadResponse> assignLead(
            @PathVariable UUID id,
            @Valid @RequestBody AssignLeadRequest request) {
        LeadResponse response = leadService.assignLead(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Convert lead to contact", description = "Convert a lead to a contact")
    public ResponseEntity<Map<String, UUID>> convertLeadToContact(@PathVariable UUID id) {
        UUID contactId = leadService.convertLeadToContact(id);
        return ResponseEntity.ok(Map.of("contactId", contactId));
    }
}
