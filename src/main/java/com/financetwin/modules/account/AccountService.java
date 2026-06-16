package com.financetwin.modules.account;

import java.util.List;
import java.util.UUID;

import com.financetwin.modules.account.dto.AccountView;
import com.financetwin.modules.account.dto.ApplyBalanceAdjustmentCommand;
import com.financetwin.modules.account.dto.CreateAccountCommand;

import jakarta.validation.Valid;

public interface AccountService {

    AccountView createAccount(@Valid CreateAccountCommand command);

    AccountView getOwnedAccount(UUID userId, UUID accountId);

    AccountView applyBalanceAdjustment(@Valid ApplyBalanceAdjustmentCommand command);

    List<AccountView> listAccounts(UUID userId);
}
