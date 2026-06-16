package com.financetwin.modules.category;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.financetwin.modules.category.dto.CategoryView;
import com.financetwin.modules.category.dto.CreateCategoryCommand;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private DefaultCategoryService categoryService;

    @Test
    void shouldCreateUserCategoryWithGlobalParent() {
        UUID userId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        Category parent = new Category(null, null, "Food", "fork", "#FF0000", CategoryType.EXPENSE);
        ReflectionTestUtils.setField(parent, "id", parentId);

        when(categoryRepository.findById(parentId)).thenReturn(Optional.of(parent));
        when(categoryRepository.saveAndFlush(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            ReflectionTestUtils.setField(category, "id", UUID.fromString("d3d4b0c9-a5a4-4307-ad51-eb0a1552d15b"));
            ReflectionTestUtils.setField(category, "createdAt", Instant.parse("2026-06-16T00:00:00Z"));
            ReflectionTestUtils.setField(category, "updatedAt", Instant.parse("2026-06-16T00:00:00Z"));
            return category;
        });

        CategoryView categoryView = categoryService.createCategory(new CreateCategoryCommand(
                userId,
                parentId,
                " Delivery ",
                "bike",
                "#00FF00",
                CategoryType.EXPENSE
        ));

        assertThat(categoryView.userId()).isEqualTo(userId);
        assertThat(categoryView.parentCategoryId()).isEqualTo(parentId);
        assertThat(categoryView.name()).isEqualTo("Delivery");
        assertThat(categoryView.type()).isEqualTo(CategoryType.EXPENSE);
        verify(categoryRepository).saveAndFlush(any(Category.class));
    }

    @Test
    void shouldRejectParentOwnedByAnotherUser() {
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        Category parent = new Category(otherUserId, null, "Salary", null, null, CategoryType.INCOME);
        ReflectionTestUtils.setField(parent, "id", parentId);

        when(categoryRepository.findById(parentId)).thenReturn(Optional.of(parent));

        assertThatThrownBy(() -> categoryService.createCategory(new CreateCategoryCommand(
                userId,
                parentId,
                "Bonus",
                null,
                null,
                CategoryType.INCOME
        ))).isInstanceOf(InvalidCategoryParentException.class);
    }

    @Test
    void shouldReturnAccessibleGlobalCategory() {
        UUID categoryId = UUID.randomUUID();
        Category category = new Category(null, null, "Transport", null, null, CategoryType.EXPENSE);
        ReflectionTestUtils.setField(category, "id", categoryId);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        CategoryView categoryView = categoryService.getAccessibleCategory(UUID.randomUUID(), categoryId);

        assertThat(categoryView.id()).isEqualTo(categoryId);
        assertThat(categoryView.userId()).isNull();
    }
}
