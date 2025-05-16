package com.mindcare.mindcare_backend.util;

import java.time.*;
import java.time.format.DateTimeFormatter;

public class DateUtils {
    // Định dạng ngày như "2025-05-14"
    public static String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ISO_DATE);
    }

    // Định dạng timestamp như "2025-05-14T15:30:00"
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ISO_DATE_TIME);
    }

    // Chuyển String ISO_DATE → LocalDate
    public static LocalDate parseDate(String s) {
        return LocalDate.parse(s, DateTimeFormatter.ISO_DATE);
    }
}