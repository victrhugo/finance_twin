package com.financetwin.modules.user.dto;

import java.time.Instant;
import java.util.UUID;

public record UserView(
        UUID id,
        String email,
        Instant createdAt,
        Instant updatedAt,
        UserPreferencesView preferences
) {
}
