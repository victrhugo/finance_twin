package com.financetwin.modules.user;

public final class UserEmailAlreadyInUseException extends RuntimeException {

    public UserEmailAlreadyInUseException(String email) {
        super("User email already in use: " + email);
    }
}
