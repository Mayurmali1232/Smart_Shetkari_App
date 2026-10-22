package com.smartshetkari.user.dto;

public class ProfileResponse {

    private Long userId;
    private String mobileNumber;
    private String email;
    private String fullName;
    private String village;
    private String district;
    private String state;
    private String preferredLanguage;
    private String currency;

    public ProfileResponse() {
    }

    public ProfileResponse(Long userId, String mobileNumber, String email, String fullName,
                           String village, String district, String state,
                           String preferredLanguage, String currency) {
        this.userId = userId;
        this.mobileNumber = mobileNumber;
        this.email = email;
        this.fullName = fullName;
        this.village = village;
        this.district = district;
        this.state = state;
        this.preferredLanguage = preferredLanguage;
        this.currency = currency;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
