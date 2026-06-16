package com.financetwin.modules.transaction;

import java.util.List;
import java.util.UUID;

import com.financetwin.modules.transaction.dto.CreateTransactionCommand;
import com.financetwin.modules.transaction.dto.TransactionView;

import jakarta.validation.Valid;

public interface TransactionService {

    TransactionView createTransaction(@Valid CreateTransactionCommand command);

    List<TransactionView> listTransactions(UUID userId);
}
