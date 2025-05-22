package com.mindcare.mindcare_backend.dto.response;


// DTO chung cho API response, bao gồm trạng thái thành công, thông điệp và dữ liệu
public class GenericApiResponse<T> {
    private boolean success;
    private String message;
    private T data; // Dữ liệu trả về, có thể là bất kỳ kiểu gì hoặc null

    public GenericApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public GenericApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    // Static factory methods (để tạo response nhanh hơn)
    public static <T> GenericApiResponse<T> success(T data, String message) {
        return new GenericApiResponse<>(true, message, data);
    }

    public static GenericApiResponse<Void> success(String message) {
        return new GenericApiResponse<>(true, message, null);
    }

    public static GenericApiResponse<Void> error(String message) {
        return new GenericApiResponse<>(false, message, null);
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}