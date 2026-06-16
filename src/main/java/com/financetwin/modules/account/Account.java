package com.financetwin.modules.account;

import java.math.BigDecimal;
import java.time.Instant;
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
@Table(name = "accounts", schema = "finance_twin")
class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountType type;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Account() {
    }

    Account(UUID userId, String name, AccountType type, String currency) {
        this.userId = userId;
        this.name = name;
        this.type = type;
        this.currency = currency;
        this.status = AccountStatus.ACTIVE;
        this.balance = BigDecimal.ZERO;
    }

    UUID getId() {
        return id;
    }

    UUID getUserId() {
        return userId;
    }

    String getName() {
        return name;
    }

    AccountType getType() {
        return type;
    }

    BigDecimal getBalance() {
        return balance;
    }

    String getCurrency() {
        return currency;
    }

    AccountStatus getStatus() {
        return status;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    void applyAdjustment(AccountBalanceAdjustmentType adjustmentType, BigDecimal amount) {
        if (adjustmentType == AccountBalanceAdjustmentType.CREDIT) {
            balance = balance.add(amount);
            return;
        }

        balance = balance.subtract(amount);
    }
}
