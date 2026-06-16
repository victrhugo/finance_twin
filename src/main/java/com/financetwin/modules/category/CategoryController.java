package com.financetwin.modules.category;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.financetwin.modules.category.dto.CategoryView;
import com.financetwin.modules.category.dto.CreateCategoryCommand;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<CategoryView> createCategory(@Valid @RequestBody CreateCategoryCommand command) {
        CategoryView categoryView = categoryService.createCategory(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryView);
    }

    @GetMapping
    public ResponseEntity<List<CategoryView>> listCategories(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId
    ) {
        UUID userId = headerUserId != null ? headerUserId : paramUserId;
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required. Please provide it in the 'X-User-Id' header or as a 'userId' query parameter.");
        }
        List<CategoryView> categories = categoryService.listCategories(userId);
        return ResponseEntity.ok(categories);
    }
}
