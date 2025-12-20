package com.example.crm.lead.dto;

import com.example.crm.lead.entity.LeadStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeadResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String company;
    private LeadStatus status;
    private UUID assignedToId;
    private String assignedToUsername;
    private UUID tenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
