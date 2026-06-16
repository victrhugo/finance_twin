package com.financetwin.modules.transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "transactions", schema = "finance_twin")
class FinancialTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "account_id", nullable = false, updatable = false)
    private UUID accountId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType type;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private OffsetDateTime transactionDate;

    @Column(name = "transfer_transaction_id")
    private UUID transferTransactionId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected FinancialTransaction() {
    }

    FinancialTransaction(
            UUID userId,
            UUID accountId,
            UUID categoryId,
            TransactionType type,
            BigDecimal amount,
            String description,
            OffsetDateTime transactionDate,
            UUID transferTransactionId
    ) {
        this.userId = userId;
        this.accountId = accountId;
        this.categoryId = categoryId;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.transactionDate = transactionDate;
        this.transferTransactionId = transferTransactionId;
    }

    UUID getId() {
        return id;
    }

    UUID getUserId() {
        return userId;
    }

    UUID getAccountId() {
        return accountId;
    }

    UUID getCategoryId() {
        return categoryId;
    }

    TransactionType getType() {
        return type;
    }

    BigDecimal getAmount() {
        return amount;
    }

    String getDescription() {
        return description;
    }

    OffsetDateTime getTransactionDate() {
        return transactionDate;
    }

    UUID getTransferTransactionId() {
        return transferTransactionId;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    void linkTransfer(UUID linkedTransactionId) {
        this.transferTransactionId = linkedTransactionId;
    }
}
