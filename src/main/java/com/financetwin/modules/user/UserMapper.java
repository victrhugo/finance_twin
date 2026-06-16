package com.financetwin.modules.user;

import java.util.Locale;

import com.financetwin.modules.user.dto.CreateUserCommand;
import com.financetwin.modules.user.dto.UserPreferencesView;
import com.financetwin.modules.user.dto.UserView;

final class UserMapper {

    private UserMapper() {
    }

    static User toNewEntity(CreateUserCommand command, String normalizedEmail) {
        return new User(normalizedEmail, command.passwordHash());
    }

    static UserView toView(User user) {
        UserPreferences preferences = user.getPreferences();

        return new UserView(
                user.getId(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                preferences == null ? null : new UserPreferencesView(
                        preferences.getCurrency(),
                        preferences.getTheme(),
                        preferences.getTimezone()
                )
        );
    }

    static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
