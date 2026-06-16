package com.financetwin.modules.user.dto;

public record UserPreferencesView(
        String currency,
        String theme,
        String timezone
) {
}
