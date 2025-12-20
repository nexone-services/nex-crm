package com.example.crm.deal.dto;

import com.example.crm.deal.entity.DealStage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealResponse {
    private UUID id;
    private String name;
    private BigDecimal amount;
    private DealStage stage;
    private UUID contactId;
    private String contactName;
    private UUID tenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
