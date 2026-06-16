package com.financetwin.modules.category;

import java.util.UUID;

public final class CategoryNotFoundException extends RuntimeException {

    public CategoryNotFoundException(UUID categoryId, UUID userId) {
        super("Category not found or inaccessible. categoryId=" + categoryId + ", userId=" + userId);
    }
}
