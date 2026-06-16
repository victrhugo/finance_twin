package com.financetwin.modules.transaction;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, UUID> {

    List<FinancialTransaction> findByUserIdOrderByTransactionDateDesc(UUID userId);
}
