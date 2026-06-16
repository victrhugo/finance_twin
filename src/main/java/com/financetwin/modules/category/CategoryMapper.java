package com.financetwin.modules.category;

import com.financetwin.modules.category.dto.CategoryView;
import com.financetwin.modules.category.dto.CreateCategoryCommand;

final class CategoryMapper {

    private CategoryMapper() {
    }

    static Category toNewEntity(CreateCategoryCommand command, Category parentCategory) {
        return new Category(
                command.userId(),
                parentCategory,
                normalizeName(command.name()),
                normalizeOptional(command.icon()),
                normalizeOptional(command.color()),
                command.type()
        );
    }

    static CategoryView toView(Category category) {
        return new CategoryView(
                category.getId(),
                category.getUserId(),
                category.getParentCategory() == null ? null : category.getParentCategory().getId(),
                category.getName(),
                category.getIcon(),
                category.getColor(),
                category.getType(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    static String normalizeName(String name) {
        return name.trim();
    }

    static String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
