package com.financetwin.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserPreferencesInput(
        @NotBlank
        @Pattern(regexp = "^[A-Z]{3}$")
        String currency,

        @NotBlank
        @Size(max = 15)
        String theme,

        @NotBlank
        @Size(max = 50)
        String timezone
) {
}
