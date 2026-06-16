package com.financetwin.modules.transaction;

import java.time.OffsetDateTime;
import java.util.Locale;

import com.financetwin.modules.transaction.dto.CreateTransactionCommand;
import com.financetwin.modules.transaction.dto.TransactionView;

final class TransactionMapper {

    private TransactionMapper() {
    }

    static FinancialTransaction toNewEntity(CreateTransactionCommand command, TransactionType type, java.util.UUID accountId, java.util.UUID categoryId, java.util.UUID linkedTransactionId) {
        return new FinancialTransaction(
                command.userId(),
                accountId,
                categoryId,
                type,
                command.amount(),
                normalizeDescription(command.description()),
                command.transactionDate(),
                linkedTransactionId
        );
    }

    static TransactionView toView(FinancialTransaction transaction) {
        return new TransactionView(
                transaction.getId(),
                transaction.getUserId(),
                transaction.getAccountId(),
                transaction.getCategoryId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getTransactionDate(),
                transaction.getTransferTransactionId(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }

    static String normalizeDescription(String description) {
        return description.trim();
    }

    static OffsetDateTime defaultTransactionDate(OffsetDateTime transactionDate) {
        return transactionDate == null ? OffsetDateTime.now() : transactionDate;
    }

    static String normalizeOptionalText(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}
