CREATE SCHEMA IF NOT EXISTS finance_twin;

SET search_path TO finance_twin;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_email_not_blank CHECK (BTRIM(email) <> ''),
    CONSTRAINT chk_users_password_hash_not_blank CHECK (BTRIM(password_hash) <> '')
);

CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY,
    currency VARCHAR(3) NOT NULL,
    theme VARCHAR(15) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    CONSTRAINT fk_user_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_user_preferences_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_user_preferences_theme_not_blank CHECK (BTRIM(theme) <> ''),
    CONSTRAINT chk_user_preferences_timezone_not_blank CHECK (BTRIM(timezone) <> '')
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(30) NOT NULL,
    balance NUMERIC(19,4) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_accounts_name_not_blank CHECK (BTRIM(name) <> ''),
    CONSTRAINT chk_accounts_type_not_blank CHECK (BTRIM(type) <> ''),
    CONSTRAINT chk_accounts_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_accounts_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    parent_category_id UUID NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NULL,
    color VARCHAR(7) NULL,
    type VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_category_id)
        REFERENCES categories (id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_categories_name_not_blank CHECK (BTRIM(name) <> ''),
    CONSTRAINT chk_categories_type_not_blank CHECK (BTRIM(type) <> ''),
    CONSTRAINT chk_categories_color_format CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_categories_not_self_parent CHECK (parent_category_id IS NULL OR parent_category_id <> id)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    account_id UUID NOT NULL,
    category_id UUID NULL,
    type VARCHAR(30) NOT NULL,
    amount NUMERIC(19,4) NOT NULL,
    description VARCHAR(255) NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL,
    transfer_transaction_id UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_transactions_transfer
        FOREIGN KEY (transfer_transaction_id)
        REFERENCES transactions (id)
        ON DELETE RESTRICT
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT chk_transactions_type CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER_IN', 'TRANSFER_OUT')),
    CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_transactions_description_not_blank CHECK (BTRIM(description) <> ''),
    CONSTRAINT chk_transactions_not_self_transfer CHECK (transfer_transaction_id IS NULL OR transfer_transaction_id <> id)
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category_id UUID NOT NULL,
    amount NUMERIC(19,4) NOT NULL,
    period VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_budgets_user_category_period UNIQUE (user_id, category_id, period),
    CONSTRAINT chk_budgets_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_budgets_period_format CHECK (period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

CREATE TABLE twin_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    period VARCHAR(7) NOT NULL,
    score_final INTEGER NOT NULL,
    score_factor_1 INTEGER NOT NULL,
    score_factor_2 INTEGER NOT NULL,
    score_factor_3 INTEGER NOT NULL,
    score_factor_4 INTEGER NOT NULL,
    score_factor_5 INTEGER NOT NULL,
    score_factor_6 INTEGER NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_twin_scores_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_twin_scores_user_period UNIQUE (user_id, period),
    CONSTRAINT chk_twin_scores_period_format CHECK (period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    CONSTRAINT chk_twin_scores_final_range CHECK (score_final BETWEEN 0 AND 100),
    CONSTRAINT chk_twin_scores_factor_1_range CHECK (score_factor_1 BETWEEN 0 AND 100),
    CONSTRAINT chk_twin_scores_factor_2_range CHECK (score_factor_2 BETWEEN 0 AND 100),
    CONSTRAINT chk_twin_scores_factor_3_range CHECK (score_factor_3 BETWEEN 0 AND 100),
    CONSTRAINT chk_twin_scores_factor_4_range CHECK (score_factor_4 BETWEEN 0 AND 100),
    CONSTRAINT chk_twin_scores_factor_5_range CHECK (score_factor_5 BETWEEN 0 AND 100),
    CONSTRAINT chk_twin_scores_factor_6_range CHECK (score_factor_6 BETWEEN 0 AND 100)
);

CREATE TABLE twin_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_twin_insights_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_twin_insights_type_not_blank CHECK (BTRIM(type) <> ''),
    CONSTRAINT chk_twin_insights_title_not_blank CHECK (BTRIM(title) <> ''),
    CONSTRAINT chk_twin_insights_description_not_blank CHECK (BTRIM(description) <> ''),
    CONSTRAINT chk_twin_insights_status_not_blank CHECK (BTRIM(status) <> ''),
    CONSTRAINT chk_twin_insights_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX idx_accounts_user_id
    ON accounts (user_id);

CREATE INDEX idx_categories_user_id
    ON categories (user_id);

CREATE INDEX idx_categories_parent_category_id
    ON categories (parent_category_id);

CREATE INDEX idx_transactions_user_date
    ON transactions (user_id, transaction_date DESC);

CREATE INDEX idx_transactions_account_date
    ON transactions (account_id, transaction_date DESC);

CREATE INDEX idx_transactions_category_id
    ON transactions (category_id);

CREATE UNIQUE INDEX uq_transactions_transfer_transaction_id
    ON transactions (transfer_transaction_id)
    WHERE transfer_transaction_id IS NOT NULL;

CREATE INDEX idx_budgets_user_period
    ON budgets (user_id, period);

CREATE INDEX idx_budgets_category_id
    ON budgets (category_id);
