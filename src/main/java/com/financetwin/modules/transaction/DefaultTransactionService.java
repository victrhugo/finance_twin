package com.financetwin.modules.transaction;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.financetwin.modules.account.AccountBalanceAdjustmentType;
import com.financetwin.modules.account.AccountService;
import com.financetwin.modules.account.AccountStatus;
import com.financetwin.modules.account.dto.AccountView;
import com.financetwin.modules.account.dto.ApplyBalanceAdjustmentCommand;
import com.financetwin.modules.category.CategoryService;
import com.financetwin.modules.category.CategoryType;
import com.financetwin.modules.category.dto.CategoryView;
import com.financetwin.modules.transaction.dto.CreateTransactionCommand;
import com.financetwin.modules.transaction.dto.TransactionView;

@Service
@Validated
class DefaultTransactionService implements TransactionService {

    private final FinancialTransactionRepository financialTransactionRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;

    DefaultTransactionService(
            FinancialTransactionRepository financialTransactionRepository,
            AccountService accountService,
            CategoryService categoryService
    ) {
        this.financialTransactionRepository = financialTransactionRepository;
        this.accountService = accountService;
        this.categoryService = categoryService;
    }

    @Override
    @Transactional
    public TransactionView createTransaction(CreateTransactionCommand command) {
        return switch (command.operationType()) {
            case INCOME -> createIncome(command);
            case EXPENSE -> createExpense(command);
            case TRANSFER -> createTransfer(command);
        };
    }

    private TransactionView createIncome(CreateTransactionCommand command) {
        AccountView account = loadActiveOwnedAccount(command.userId(), command.accountId());
        UUID categoryId = resolveCategory(command, CategoryType.INCOME);

        FinancialTransaction transaction = TransactionMapper.toNewEntity(
                command.withDefaultTransactionDate(),
                TransactionType.INCOME,
                account.id(),
                categoryId,
                null
        );

        FinancialTransaction savedTransaction = saveWithGeneratedId(transaction);
        accountService.applyBalanceAdjustment(new ApplyBalanceAdjustmentCommand(
                command.userId(),
                account.id(),
                AccountBalanceAdjustmentType.CREDIT,
                command.amount()
        ));
        return TransactionMapper.toView(savedTransaction);
    }

    private TransactionView createExpense(CreateTransactionCommand command) {
        AccountView account = loadActiveOwnedAccount(command.userId(), command.accountId());
        UUID categoryId = resolveCategory(command, CategoryType.EXPENSE);

        FinancialTransaction transaction = TransactionMapper.toNewEntity(
                command.withDefaultTransactionDate(),
                TransactionType.EXPENSE,
                account.id(),
                categoryId,
                null
        );

        FinancialTransaction savedTransaction = saveWithGeneratedId(transaction);
        accountService.applyBalanceAdjustment(new ApplyBalanceAdjustmentCommand(
                command.userId(),
                account.id(),
                AccountBalanceAdjustmentType.DEBIT,
                command.amount()
        ));
        return TransactionMapper.toView(savedTransaction);
    }

    private TransactionView createTransfer(CreateTransactionCommand command) {
        if (command.categoryId() != null) {
            throw new InvalidTransactionException("Transfers cannot have a category.");
        }

        if (command.destinationAccountId() == null) {
            throw new InvalidTransactionException("Transfers require a destination account.");
        }

        if (command.accountId().equals(command.destinationAccountId())) {
            throw new InvalidTransactionException("Source and destination accounts must be different.");
        }

        AccountView sourceAccount = loadActiveOwnedAccount(command.userId(), command.accountId());
        AccountView destinationAccount = loadActiveOwnedAccount(command.userId(), command.destinationAccountId());

        FinancialTransaction outbound = saveWithGeneratedId(TransactionMapper.toNewEntity(
                command.withDefaultTransactionDate(),
                TransactionType.TRANSFER_OUT,
                sourceAccount.id(),
                null,
                null
        ));

        FinancialTransaction inbound = saveWithGeneratedId(TransactionMapper.toNewEntity(
                command.withDefaultTransactionDate(),
                TransactionType.TRANSFER_IN,
                destinationAccount.id(),
                null,
                outbound.getId()
        ));

        outbound.linkTransfer(inbound.getId());
        FinancialTransaction linkedOutbound = financialTransactionRepository.saveAndFlush(outbound);

        accountService.applyBalanceAdjustment(new ApplyBalanceAdjustmentCommand(
                command.userId(),
                sourceAccount.id(),
                AccountBalanceAdjustmentType.DEBIT,
                command.amount()
        ));
        accountService.applyBalanceAdjustment(new ApplyBalanceAdjustmentCommand(
                command.userId(),
                destinationAccount.id(),
                AccountBalanceAdjustmentType.CREDIT,
                command.amount()
        ));

        return TransactionMapper.toView(linkedOutbound);
    }

    private UUID resolveCategory(CreateTransactionCommand command, CategoryType expectedType) {
        if (command.categoryId() == null) {
            return null;
        }

        CategoryView category = categoryService.getAccessibleCategory(command.userId(), command.categoryId());
        if (category.type() != expectedType) {
            throw new InvalidTransactionException("Category type does not match transaction type.");
        }

        return category.id();
    }

    private AccountView loadActiveOwnedAccount(UUID userId, UUID accountId) {
        AccountView account = accountService.getOwnedAccount(userId, accountId);
        if (account.status() == AccountStatus.INACTIVE) {
            throw new InvalidTransactionException("Account is inactive: " + accountId);
        }
        return account;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionView> listTransactions(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null.");
        }
        return financialTransactionRepository.findByUserIdOrderByTransactionDateDesc(userId)
                .stream()
                .map(TransactionMapper::toView)
                .toList();
    }

    private FinancialTransaction saveWithGeneratedId(FinancialTransaction transaction) {
        return financialTransactionRepository.saveAndFlush(transaction);
    }
}
