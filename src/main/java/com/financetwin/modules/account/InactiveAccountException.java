package com.financetwin.modules.account;

import java.util.UUID;

public final class InactiveAccountException extends RuntimeException {

    public InactiveAccountException(UUID accountId) {
        super("Account is inactive: " + accountId);
    }
}
