package com.financetwin.modules.category;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories", schema = "finance_twin")
class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_category_id")
    private Category parentCategory;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String icon;

    @Column(length = 7)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoryType type;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Category() {
    }

    Category(UUID userId, Category parentCategory, String name, String icon, String color, CategoryType type) {
        this.userId = userId;
        this.parentCategory = parentCategory;
        this.name = name;
        this.icon = icon;
        this.color = color;
        this.type = type;
    }

    UUID getId() {
        return id;
    }

    UUID getUserId() {
        return userId;
    }

    Category getParentCategory() {
        return parentCategory;
    }

    String getName() {
        return name;
    }

    String getIcon() {
        return icon;
    }

    String getColor() {
        return color;
    }

    CategoryType getType() {
        return type;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    boolean isGlobal() {
        return userId == null;
    }
}
