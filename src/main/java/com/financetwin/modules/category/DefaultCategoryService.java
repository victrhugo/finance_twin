package com.financetwin.modules.category;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.financetwin.modules.category.dto.CategoryView;
import com.financetwin.modules.category.dto.CreateCategoryCommand;

@Service
@Validated
class DefaultCategoryService implements CategoryService {

    private final CategoryRepository categoryRepository;

    DefaultCategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public CategoryView createCategory(CreateCategoryCommand command) {
        Category parentCategory = loadParentCategory(command.parentCategoryId());
        validateParentOwnership(command.userId(), parentCategory);
        validateParentType(command.type(), parentCategory);

        Category savedCategory = categoryRepository.saveAndFlush(CategoryMapper.toNewEntity(command, parentCategory));
        return CategoryMapper.toView(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryView getAccessibleCategory(UUID userId, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .filter(found -> isAccessible(userId, found))
                .orElseThrow(() -> new CategoryNotFoundException(categoryId, userId));

        return CategoryMapper.toView(category);
    }

    private Category loadParentCategory(UUID parentCategoryId) {
        if (parentCategoryId == null) {
            return null;
        }

        return categoryRepository.findById(parentCategoryId)
                .orElseThrow(() -> new InvalidCategoryParentException("Parent category not found: " + parentCategoryId));
    }

    private void validateParentOwnership(UUID userId, Category parentCategory) {
        if (parentCategory == null) {
            return;
        }

        if (userId == null && !parentCategory.isGlobal()) {
            throw new InvalidCategoryParentException("Global categories can only have global parents.");
        }

        if (userId != null && parentCategory.getUserId() != null && !userId.equals(parentCategory.getUserId())) {
            throw new InvalidCategoryParentException("Parent category belongs to another user.");
        }
    }

    private void validateParentType(CategoryType type, Category parentCategory) {
        if (parentCategory != null && parentCategory.getType() != type) {
            throw new InvalidCategoryParentException("Child category must have the same type as its parent.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryView> listCategories(UUID userId) {
        return categoryRepository.findByUserIdOrUserIdIsNull(userId).stream()
                .map(CategoryMapper::toView)
                .toList();
    }

    private boolean isAccessible(UUID userId, Category category) {
        return category.isGlobal() || category.getUserId().equals(userId);
    }
}
