package com.financetwin.modules.transaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.financetwin.modules.account.AccountService;
import com.financetwin.modules.account.AccountStatus;
import com.financetwin.modules.account.AccountType;
import com.financetwin.modules.account.dto.AccountView;
import com.financetwin.modules.category.CategoryService;
import com.financetwin.modules.category.CategoryType;
import com.financetwin.modules.category.dto.CategoryView;
import com.financetwin.modules.transaction.dto.CreateTransactionCommand;
import com.financetwin.modules.transaction.dto.TransactionView;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private FinancialTransactionRepository financialTransactionRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private DefaultTransactionService transactionService;

    @Test
    void shouldCreateIncomeTransactionAndCreditAccount() {
        UUID userId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        when(accountService.getOwnedAccount(userId, accountId)).thenReturn(accountView(userId, accountId, "0.0000"));
        when(categoryService.getAccessibleCategory(userId, categoryId)).thenReturn(categoryView(categoryId, userId, CategoryType.INCOME));
        when(financialTransactionRepository.saveAndFlush(any(FinancialTransaction.class))).thenAnswer(invocation -> {
            FinancialTransaction transaction = invocation.getArgument(0);
            if (transaction.getId() == null) {
                ReflectionTestUtils.setField(transaction, "id", UUID.fromString("6d37b0d9-1c47-4f0d-9f5e-2aeb241305f9"));
                ReflectionTestUtils.setField(transaction, "createdAt", Instant.parse("2026-06-16T00:00:00Z"));
                ReflectionTestUtils.setField(transaction, "updatedAt", Instant.parse("2026-06-16T00:00:00Z"));
            }
            return transaction;
        });

        TransactionView transactionView = transactionService.createTransaction(new CreateTransactionCommand(
                userId,
                accountId,
                categoryId,
                null,
                TransactionOperationType.INCOME,
                new BigDecimal("120.00"),
                " Salary ",
                OffsetDateTime.parse("2026-06-16T09:00:00-03:00")
        ));

        assertThat(transactionView.type()).isEqualTo(TransactionType.INCOME);
        assertThat(transactionView.accountId()).isEqualTo(accountId);
        assertThat(transactionView.categoryId()).isEqualTo(categoryId);
        assertThat(transactionView.description()).isEqualTo("Salary");
        verify(accountService).applyBalanceAdjustment(any());
    }

    @Test
    void shouldRejectMismatchedCategoryType() {
        UUID userId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        when(accountService.getOwnedAccount(userId, accountId)).thenReturn(accountView(userId, accountId, "0.0000"));
        when(categoryService.getAccessibleCategory(userId, categoryId)).thenReturn(categoryView(categoryId, userId, CategoryType.INCOME));

        assertThatThrownBy(() -> transactionService.createTransaction(new CreateTransactionCommand(
                userId,
                accountId,
                categoryId,
                null,
                TransactionOperationType.EXPENSE,
                new BigDecimal("50.00"),
                "Groceries",
                OffsetDateTime.parse("2026-06-16T10:00:00-03:00")
        ))).isInstanceOf(InvalidTransactionException.class);
    }

    @Test
    void shouldCreateTransferPairAndAdjustBothAccounts() {
        UUID userId = UUID.randomUUID();
        UUID sourceAccountId = UUID.randomUUID();
        UUID destinationAccountId = UUID.randomUUID();

        when(accountService.getOwnedAccount(userId, sourceAccountId)).thenReturn(accountView(userId, sourceAccountId, "100.0000"));
        when(accountService.getOwnedAccount(userId, destinationAccountId)).thenReturn(accountView(userId, destinationAccountId, "25.0000"));
        when(financialTransactionRepository.saveAndFlush(any(FinancialTransaction.class))).thenAnswer(invocation -> {
            FinancialTransaction transaction = invocation.getArgument(0);
            if (transaction.getId() == null) {
                ReflectionTestUtils.setField(transaction, "id", UUID.randomUUID());
                ReflectionTestUtils.setField(transaction, "createdAt", Instant.parse("2026-06-16T00:00:00Z"));
                ReflectionTestUtils.setField(transaction, "updatedAt", Instant.parse("2026-06-16T00:00:00Z"));
            }
            return transaction;
        });

        TransactionView transactionView = transactionService.createTransaction(new CreateTransactionCommand(
                userId,
                sourceAccountId,
                null,
                destinationAccountId,
                TransactionOperationType.TRANSFER,
                new BigDecimal("30.00"),
                "Move funds",
                OffsetDateTime.parse("2026-06-16T11:00:00-03:00")
        ));

        assertThat(transactionView.type()).isEqualTo(TransactionType.TRANSFER_OUT);
        assertThat(transactionView.transferTransactionId()).isNotNull();
        verify(financialTransactionRepository, times(3)).saveAndFlush(any(FinancialTransaction.class));
        verify(accountService, times(2)).applyBalanceAdjustment(any());
    }

    private static AccountView accountView(UUID userId, UUID accountId, String balance) {
        return new AccountView(
                accountId,
                userId,
                "Wallet",
                AccountType.CHECKING,
                new BigDecimal(balance),
                "BRL",
                AccountStatus.ACTIVE,
                Instant.parse("2026-06-16T00:00:00Z"),
                Instant.parse("2026-06-16T00:00:00Z")
        );
    }

    @Test
    void shouldListTransactionsOrderedByDate() {
        UUID userId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        FinancialTransaction transaction1 = new FinancialTransaction(
                userId, accountId, null, TransactionType.INCOME, new BigDecimal("100.00"), "Salary", OffsetDateTime.now(), null
        );
        ReflectionTestUtils.setField(transaction1, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(transaction1, "createdAt", Instant.now());
        ReflectionTestUtils.setField(transaction1, "updatedAt", Instant.now());

        when(financialTransactionRepository.findByUserIdOrderByTransactionDateDesc(userId))
                .thenReturn(java.util.List.of(transaction1));

        java.util.List<TransactionView> results = transactionService.listTransactions(userId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).description()).isEqualTo("Salary");
        verify(financialTransactionRepository).findByUserIdOrderByTransactionDateDesc(userId);
    }

    private static CategoryView categoryView(UUID categoryId, UUID userId, CategoryType type) {
        return new CategoryView(
                categoryId,
                userId,
                null,
                "Category",
                null,
                null,
                type,
                Instant.parse("2026-06-16T00:00:00Z"),
                Instant.parse("2026-06-16T00:00:00Z")
        );
    }
}
