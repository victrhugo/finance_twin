package com.financetwin.modules.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.financetwin.modules.account.dto.AccountView;
import com.financetwin.modules.account.dto.ApplyBalanceAdjustmentCommand;
import com.financetwin.modules.account.dto.CreateAccountCommand;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private DefaultAccountService accountService;

    @Test
    void shouldCreateAccount() {
        UUID userId = UUID.fromString("0f194bb4-59ab-4411-bfe7-6be50bd8534d");
        when(accountRepository.saveAndFlush(any(Account.class))).thenAnswer(invocation -> {
            Account account = invocation.getArgument(0);
            ReflectionTestUtils.setField(account, "id", UUID.fromString("dfaf386d-cf0a-4e2d-b286-50ca6af79b28"));
            ReflectionTestUtils.setField(account, "createdAt", Instant.parse("2026-06-16T00:00:00Z"));
            ReflectionTestUtils.setField(account, "updatedAt", Instant.parse("2026-06-16T00:00:00Z"));
            return account;
        });

        AccountView accountView = accountService.createAccount(new CreateAccountCommand(userId, " Main Wallet ", AccountType.CASH, "brl"));

        assertThat(accountView.id()).isEqualTo(UUID.fromString("dfaf386d-cf0a-4e2d-b286-50ca6af79b28"));
        assertThat(accountView.userId()).isEqualTo(userId);
        assertThat(accountView.name()).isEqualTo("Main Wallet");
        assertThat(accountView.currency()).isEqualTo("BRL");
        assertThat(accountView.type()).isEqualTo(AccountType.CASH);
        assertThat(accountView.status()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(accountView.balance()).isEqualByComparingTo(BigDecimal.ZERO);
        verify(accountRepository).saveAndFlush(any(Account.class));
    }

    @Test
    void shouldApplyCreditBalanceAdjustment() {
        UUID userId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        Account account = new Account(userId, "Checking", AccountType.CHECKING, "BRL");
        ReflectionTestUtils.setField(account, "id", accountId);
        ReflectionTestUtils.setField(account, "balance", new BigDecimal("10.0000"));

        when(accountRepository.findByIdAndUserId(accountId, userId)).thenReturn(Optional.of(account));
        when(accountRepository.saveAndFlush(account)).thenReturn(account);

        AccountView accountView = accountService.applyBalanceAdjustment(new ApplyBalanceAdjustmentCommand(
                userId,
                accountId,
                AccountBalanceAdjustmentType.CREDIT,
                new BigDecimal("15.5000")
        ));

        assertThat(accountView.balance()).isEqualByComparingTo("25.5000");
    }

    @Test
    void shouldRejectInactiveAccountBalanceAdjustment() {
        UUID userId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        Account account = new Account(userId, "Savings", AccountType.SAVINGS, "BRL");
        ReflectionTestUtils.setField(account, "id", accountId);
        ReflectionTestUtils.setField(account, "status", AccountStatus.INACTIVE);

        when(accountRepository.findByIdAndUserId(accountId, userId)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.applyBalanceAdjustment(new ApplyBalanceAdjustmentCommand(
                userId,
                accountId,
                AccountBalanceAdjustmentType.DEBIT,
                new BigDecimal("1.0000")
        ))).isInstanceOf(InactiveAccountException.class);
    }
}
