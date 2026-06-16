package com.financetwin.modules.account.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.financetwin.modules.account.AccountBalanceAdjustmentType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record ApplyBalanceAdjustmentCommand(
        @NotNull
        UUID userId,

        @NotNull
        UUID accountId,

        @NotNull
        AccountBalanceAdjustmentType adjustmentType,

        @NotNull
        @DecimalMin(value = "0.0001")
        BigDecimal amount
) {
}
