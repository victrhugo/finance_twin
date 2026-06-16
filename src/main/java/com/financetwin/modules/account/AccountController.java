package com.financetwin.modules.account;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.financetwin.modules.account.dto.AccountView;
import com.financetwin.modules.account.dto.CreateAccountCommand;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<AccountView> createAccount(@Valid @RequestBody CreateAccountCommand command) {
        AccountView accountView = accountService.createAccount(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(accountView);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountView> getOwnedAccount(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId
    ) {
        UUID userId = headerUserId != null ? headerUserId : paramUserId;
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required. Please provide it in the 'X-User-Id' header or as a 'userId' query parameter.");
        }
        AccountView accountView = accountService.getOwnedAccount(userId, id);
        return ResponseEntity.ok(accountView);
    }

    @GetMapping
    public ResponseEntity<List<AccountView>> listAccounts(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(value = "userId", required = false) UUID paramUserId
    ) {
        UUID userId = headerUserId != null ? headerUserId : paramUserId;
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required. Please provide it in the 'X-User-Id' header or as a 'userId' query parameter.");
        }
        List<AccountView> accounts = accountService.listAccounts(userId);
        return ResponseEntity.ok(accounts);
    }
}
