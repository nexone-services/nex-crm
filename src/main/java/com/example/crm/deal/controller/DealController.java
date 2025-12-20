package com.example.crm.deal.controller;

import com.example.crm.deal.dto.DealRequest;
import com.example.crm.deal.dto.DealResponse;
import com.example.crm.deal.service.DealService;
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
@RequestMapping("/api/v1/deals")
@RequiredArgsConstructor
@Tag(name = "Deals", description = "Deal/Opportunity management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class DealController {

    private final DealService dealService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Create a new deal", description = "Create a new deal/opportunity in the CRM")
    public ResponseEntity<DealResponse> createDeal(@Valid @RequestBody DealRequest request) {
        DealResponse response = dealService.createDeal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES', 'VIEWER')")
    @Operation(summary = "Get all deals", description = "Get all deals with pagination and sorting")
    public ResponseEntity<Page<DealResponse>> getAllDeals(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<DealResponse> deals = dealService.getAllDeals(pageable);
        return ResponseEntity.ok(deals);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES', 'VIEWER')")
    @Operation(summary = "Get deal by ID", description = "Get a specific deal by ID")
    public ResponseEntity<DealResponse> getDealById(@PathVariable UUID id) {
        DealResponse response = dealService.getDealById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Update deal", description = "Update an existing deal")
    public ResponseEntity<DealResponse> updateDeal(
            @PathVariable UUID id,
            @Valid @RequestBody DealRequest request) {
        DealResponse response = dealService.updateDeal(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete deal", description = "Delete a deal")
    public ResponseEntity<Void> deleteDeal(@PathVariable UUID id) {
        dealService.deleteDeal(id);
        return ResponseEntity.noContent().build();
    }
}
