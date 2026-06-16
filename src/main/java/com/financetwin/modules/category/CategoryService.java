package com.financetwin.modules.category;

import java.util.List;
import java.util.UUID;

import com.financetwin.modules.category.dto.CategoryView;
import com.financetwin.modules.category.dto.CreateCategoryCommand;

import jakarta.validation.Valid;

public interface CategoryService {

    CategoryView createCategory(@Valid CreateCategoryCommand command);

    CategoryView getAccessibleCategory(UUID userId, UUID categoryId);

    List<CategoryView> listCategories(UUID userId);
}
