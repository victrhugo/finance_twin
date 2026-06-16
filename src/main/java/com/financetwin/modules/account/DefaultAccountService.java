package com.financetwin.modules.account;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.financetwin.modules.account.dto.AccountView;
import com.financetwin.modules.account.dto.ApplyBalanceAdjustmentCommand;
import com.financetwin.modules.account.dto.CreateAccountCommand;

@Service
@Validated
class DefaultAccountService implements AccountService {

    private final AccountRepository accountRepository;

    DefaultAccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional
    public AccountView createAccount(CreateAccountCommand command) {
        Account savedAccount = accountRepository.saveAndFlush(AccountMapper.toNewEntity(command));
        return AccountMapper.toView(savedAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountView getOwnedAccount(UUID userId, UUID accountId) {
        return AccountMapper.toView(loadOwnedAccount(userId, accountId));
    }

    @Override
    @Transactional
    public AccountView applyBalanceAdjustment(ApplyBalanceAdjustmentCommand command) {
        Account account = loadOwnedAccount(command.userId(), command.accountId());

        if (account.getStatus() == AccountStatus.INACTIVE) {
            throw new InactiveAccountException(account.getId());
        }

        account.applyAdjustment(command.adjustmentType(), command.amount());
        Account savedAccount = accountRepository.saveAndFlush(account);
        return AccountMapper.toView(savedAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountView> listAccounts(UUID userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(AccountMapper::toView)
                .toList();
    }

    private Account loadOwnedAccount(UUID userId, UUID accountId) {
        return accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new AccountNotFoundException(accountId, userId));
    }
}
