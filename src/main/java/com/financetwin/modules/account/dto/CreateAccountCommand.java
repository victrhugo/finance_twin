package com.financetwin.modules.account.dto;

import java.util.UUID;

import com.financetwin.modules.account.AccountType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateAccountCommand(
        @NotNull
        UUID userId,

        @NotBlank
        @Size(max = 120)
        String name,

        @NotNull
        AccountType type,

        @NotBlank
        @Pattern(regexp = "^[A-Za-z]{3}$")
        String currency
) {
}
