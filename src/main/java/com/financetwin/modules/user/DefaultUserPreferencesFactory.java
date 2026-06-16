package com.financetwin.modules.user;

final class DefaultUserPreferencesFactory {

    private static final String DEFAULT_CURRENCY = "BRL";
    private static final String DEFAULT_THEME = "SYSTEM";
    private static final String DEFAULT_TIMEZONE = "America/Sao_Paulo";

    UserPreferences create() {
        return new UserPreferences(DEFAULT_CURRENCY, DEFAULT_THEME, DEFAULT_TIMEZONE);
    }
}
