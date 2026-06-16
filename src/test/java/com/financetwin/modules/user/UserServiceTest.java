package com.financetwin.modules.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.financetwin.modules.user.dto.CreateUserCommand;
import com.financetwin.modules.user.dto.UserView;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DefaultUserService userService;

    @Test
    void shouldCreateUserWithDefaultPreferences() {
        when(userRepository.existsByEmailIgnoreCase("test@financetwin.com")).thenReturn(false);
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);

            ReflectionTestUtils.setField(user, "id", UUID.fromString("33b58d8f-683b-4e10-b5d2-a9a3701baf8f"));
            ReflectionTestUtils.setField(user, "createdAt", Instant.parse("2026-06-15T22:00:00Z"));
            ReflectionTestUtils.setField(user, "updatedAt", Instant.parse("2026-06-15T22:00:00Z"));

            return user;
        });

        UserView createdUser = userService.createUser(new CreateUserCommand("  Test@FinanceTwin.com  ", "plain-password"));

        assertThat(createdUser.id()).isEqualTo(UUID.fromString("33b58d8f-683b-4e10-b5d2-a9a3701baf8f"));
        assertThat(createdUser.email()).isEqualTo("test@financetwin.com");
        assertThat(createdUser.preferences()).isNotNull();
        assertThat(createdUser.preferences().currency()).isEqualTo("BRL");
        assertThat(createdUser.preferences().theme()).isEqualTo("SYSTEM");
        assertThat(createdUser.preferences().timezone()).isEqualTo("America/Sao_Paulo");
        verify(userRepository).existsByEmailIgnoreCase("test@financetwin.com");
        verify(userRepository).saveAndFlush(any(User.class));
    }

    @Test
    void shouldRejectDuplicateEmailIgnoringCase() {
        when(userRepository.existsByEmailIgnoreCase("user@financetwin.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(new CreateUserCommand("USER@FinanceTwin.com", "another-password")))
                .isInstanceOf(UserEmailAlreadyInUseException.class)
                .hasMessageContaining("user@financetwin.com");

        verify(userRepository).existsByEmailIgnoreCase(eq("user@financetwin.com"));
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }
}
