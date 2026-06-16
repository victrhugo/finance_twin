package com.financetwin.modules.category.dto;

import java.time.Instant;
import java.util.UUID;

import com.financetwin.modules.category.CategoryType;

public record CategoryView(
        UUID id,
        UUID userId,
        UUID parentCategoryId,
        String name,
        String icon,
        String color,
        CategoryType type,
        Instant createdAt,
        Instant updatedAt
) {
}
