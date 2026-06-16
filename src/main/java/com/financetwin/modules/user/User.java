package com.financetwin.modules.user;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users", schema = "finance_twin")
class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserPreferences preferences;

    protected User() {
    }

    User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
    }

    UUID getId() {
        return id;
    }

    String getEmail() {
        return email;
    }

    String getPasswordHash() {
        return passwordHash;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    UserPreferences getPreferences() {
        return preferences;
    }

    void changeEmail(String email) {
        this.email = email;
    }

    void changePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    void definePreferences(UserPreferences preferences) {
        if (preferences == null) {
            if (this.preferences != null) {
                this.preferences.unlinkUser();
            }
            this.preferences = null;
            return;
        }

        if (this.preferences != null && this.preferences != preferences) {
            this.preferences.unlinkUser();
        }

        this.preferences = preferences;
        preferences.linkUser(this);
    }
}
