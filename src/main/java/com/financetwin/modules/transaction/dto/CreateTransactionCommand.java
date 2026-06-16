package com.financetwin.modules.transaction.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.financetwin.modules.transaction.TransactionOperationType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTransactionCommand(
        @NotNull
        UUID userId,

        @NotNull
        UUID accountId,

        UUID categoryId,

        UUID destinationAccountId,

        @NotNull
        TransactionOperationType operationType,

        @NotNull
        @DecimalMin(value = "0.0001")
        BigDecimal amount,

        @NotBlank
        @Size(max = 255)
        String description,

        OffsetDateTime transactionDate
) {
    public CreateTransactionCommand withDefaultTransactionDate() {
        return new CreateTransactionCommand(
                userId,
                accountId,
                categoryId,
                destinationAccountId,
                operationType,
                amount,
                description,
                transactionDate == null ? OffsetDateTime.now() : transactionDate
        );
    }
}
