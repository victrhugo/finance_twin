package com.financetwin.modules.account.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.financetwin.modules.account.AccountStatus;
import com.financetwin.modules.account.AccountType;

public record AccountView(
        UUID id,
        UUID userId,
        String name,
        AccountType type,
        BigDecimal balance,
        String currency,
        AccountStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
