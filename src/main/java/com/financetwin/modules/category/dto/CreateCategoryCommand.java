package com.financetwin.modules.category.dto;

import java.util.UUID;

import com.financetwin.modules.category.CategoryType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCategoryCommand(
        UUID userId,

        UUID parentCategoryId,

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 50)
        String icon,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$")
        String color,

        @NotNull
        CategoryType type
) {
}
