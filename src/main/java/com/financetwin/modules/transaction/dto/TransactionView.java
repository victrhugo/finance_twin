package com.financetwin.modules.transaction.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.financetwin.modules.transaction.TransactionType;

public record TransactionView(
        UUID id,
        UUID userId,
        UUID accountId,
        UUID categoryId,
        TransactionType type,
        BigDecimal amount,
        String description,
        OffsetDateTime transactionDate,
        UUID transferTransactionId,
        Instant createdAt,
        Instant updatedAt
) {
}
