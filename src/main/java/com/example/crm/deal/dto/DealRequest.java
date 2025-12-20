package com.example.crm.deal.dto;

import com.example.crm.deal.entity.DealStage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealRequest {

    @NotBlank(message = "Deal name is required")
    private String name;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private DealStage stage;

    @NotNull(message = "Contact ID is required")
    private UUID contactId;
}
