package com.financetwin.modules.transaction;

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

import com.financetwin.modules.transaction.dto.CreateTransactionCommand;
import com.financetwin.modules.transaction.dto.TransactionView;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionView> createTransaction(@Valid @RequestBody CreateTransactionCommand command) {
        TransactionView transactionView = transactionService.createTransaction(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionView);
    }

    @GetMapping
    public ResponseEntity<List<TransactionView>> listTransactions(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId
    ) {
        UUID userId = headerUserId != null ? headerUserId : paramUserId;
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required. Please provide it in the 'X-User-Id' header or as a 'userId' query parameter.");
        }
        List<TransactionView> transactions = transactionService.listTransactions(userId);
        return ResponseEntity.ok(transactions);
    }
}
