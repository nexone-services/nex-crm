package com.example.crm.contact.controller;

import com.example.crm.contact.dto.ContactRequest;
import com.example.crm.contact.dto.ContactResponse;
import com.example.crm.contact.service.ContactService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@Tag(name = "Contacts", description = "Contact management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Create a new contact", description = "Create a new contact in the CRM")
    public ResponseEntity<ContactResponse> createContact(@Valid @RequestBody ContactRequest request) {
        ContactResponse response = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES', 'VIEWER')")
    @Operation(summary = "Get all contacts", description = "Get all contacts with pagination and sorting")
    public ResponseEntity<Page<ContactResponse>> getAllContacts(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ContactResponse> contacts = contactService.getAllContacts(pageable);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES', 'VIEWER')")
    @Operation(summary = "Get contact by ID", description = "Get a specific contact by ID")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable UUID id) {
        ContactResponse response = contactService.getContactById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Update contact", description = "Update an existing contact")
    public ResponseEntity<ContactResponse> updateContact(
            @PathVariable UUID id,
            @Valid @RequestBody ContactRequest request) {
        ContactResponse response = contactService.updateContact(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete contact", description = "Delete a contact")
    public ResponseEntity<Void> deleteContact(@PathVariable UUID id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}
