package com.financetwin.modules.account;

import java.util.UUID;

public final class AccountNotFoundException extends RuntimeException {

    public AccountNotFoundException(UUID accountId, UUID userId) {
        super("Account not found for user. accountId=" + accountId + ", userId=" + userId);
    }
}
