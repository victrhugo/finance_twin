package com.financetwin.shared;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String code,
        String message,
        String path,
        List<ValidationErrorDetail> details
) {
    public ErrorResponse(int status, String error, String code, String message, String path) {
        this(Instant.now(), status, error, code, message, path, null);
    }

    public ErrorResponse(int status, String error, String code, String message, String path, List<ValidationErrorDetail> details) {
        this(Instant.now(), status, error, code, message, path, details);
    }

    public record ValidationErrorDetail(
            String field,
            String message
    ) {
    }
}
