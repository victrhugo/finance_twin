package com.financetwin.modules.category;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByUserIdOrUserIdIsNull(UUID userId);
}
