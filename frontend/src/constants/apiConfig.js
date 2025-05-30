// QUAN TRỌNG: CHỌN ĐÚNG BASE URL CHO MÔI TRƯỜNG CỦA BẠN
// 1. NẾU CHẠY BACKEND TRÊN CÙNG MÁY VỚI ANDROID EMULATOR:
// Sử dụng địa chỉ IP đặc biệt 10.0.2.2 để trỏ đến localhost của máy host.
const API_BASE_URL = 'http://10.0.2.2:8080/api'

// 2. NẾU CHẠY BACKEND TRÊN CÙNG MÁY VỚI IOS SIMULATOR:
// iOS Simulator có thể truy cập localhost của máy host trực tiếp.
//const API_BASE_URL = 'http://localhost:8080/api';

// 3. NẾU CHẠY ỨNG DỤNG TRÊN THIẾT BỊ THẬT (VÀ BACKEND CHẠY TRÊN MÁY TÍNH CỦA BẠN):
// Bạn cần thay thế 'YOUR_LOCAL_IP_ADDRESS' bằng địa chỉ IP local của máy tính
// đang chạy backend Spring Boot. Đảm bảo điện thoại và máy tính cùng một mạng Wi-Fi.
// Cách tìm IP local:
//    - Windows: Mở Command Prompt, gõ `ipconfig`, tìm "IPv4 Address" của card mạng đang dùng.
//    - macOS/Linux: Mở Terminal, gõ `ifconfig` hoặc `ip addr`, tìm địa chỉ "inet".
// Ví dụ: const API_BASE_URL = 'http://192.168.1.100:8080/api';
// const API_BASE_URL = 'http://YOUR_LOCAL_IP_ADDRESS:8080/api';


// Chọn một trong các cấu hình trên và bỏ comment dòng đó, comment các dòng khác.
// Ví dụ, nếu bạn đang dùng iOS Simulator và backend chạy ở localhost:8080:
// const API_BASE_URL = 'http://localhost:8080/api';

// Hoặc nếu dùng Android Emulator:
// const API_BASE_URL = 'http://10.0.2.2:8080/api';

export { API_BASE_URL }