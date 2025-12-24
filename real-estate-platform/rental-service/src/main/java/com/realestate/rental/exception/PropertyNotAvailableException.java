package com.realestate.rental.exception;

public class PropertyNotAvailableException extends RuntimeException {
    public PropertyNotAvailableException(String message) {
        super(message);
    }
}

