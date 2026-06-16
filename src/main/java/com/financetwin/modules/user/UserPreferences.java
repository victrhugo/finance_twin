package com.financetwin.modules.user;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_preferences", schema = "finance_twin")
class UserPreferences {

    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_preferences_user"))
    private User user;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, length = 15)
    private String theme;

    @Column(nullable = false, length = 50)
    private String timezone;

    protected UserPreferences() {
    }

    UserPreferences(String currency, String theme, String timezone) {
        this.currency = currency;
        this.theme = theme;
        this.timezone = timezone;
    }

    UUID getUserId() {
        return userId;
    }

    User getUser() {
        return user;
    }

    String getCurrency() {
        return currency;
    }

    String getTheme() {
        return theme;
    }

    String getTimezone() {
        return timezone;
    }

    void changeCurrency(String currency) {
        this.currency = currency;
    }

    void changeTheme(String theme) {
        this.theme = theme;
    }

    void changeTimezone(String timezone) {
        this.timezone = timezone;
    }

    void linkUser(User user) {
        this.user = user;
        this.userId = user != null ? user.getId() : null;
    }

    void unlinkUser() {
        this.user = null;
        this.userId = null;
    }
}
