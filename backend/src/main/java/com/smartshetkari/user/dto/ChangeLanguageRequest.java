package com.smartshetkari.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ChangeLanguageRequest {

    @NotBlank(message = "Language code is required")
    @Pattern(regexp = "^(mr|hi|en|gu|pa|kn|te|ta)$", message = "Supported languages are: mr, hi, en, gu, pa, kn, te, ta")
    private String language;

    public ChangeLanguageRequest() {
    }

    public ChangeLanguageRequest(String language) {
        this.language = language;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
