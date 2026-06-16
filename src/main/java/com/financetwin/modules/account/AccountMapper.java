package com.financetwin.modules.account;

import java.util.Locale;

import com.financetwin.modules.account.dto.AccountView;
import com.financetwin.modules.account.dto.CreateAccountCommand;

final class AccountMapper {

    private AccountMapper() {
    }

    static Account toNewEntity(CreateAccountCommand command) {
        return new Account(
                command.userId(),
                normalizeName(command.name()),
                command.type(),
                normalizeCurrency(command.currency())
        );
    }

    static AccountView toView(Account account) {
        return new AccountView(
                account.getId(),
                account.getUserId(),
                account.getName(),
                account.getType(),
                account.getBalance(),
                account.getCurrency(),
                account.getStatus(),
                account.getCreatedAt(),
                account.getUpdatedAt()
        );
    }

    static String normalizeName(String name) {
        return name.trim();
    }

    static String normalizeCurrency(String currency) {
        return currency.trim().toUpperCase(Locale.ROOT);
    }
}
