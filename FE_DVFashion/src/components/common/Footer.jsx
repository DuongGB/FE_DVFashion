import React from "react";
import { Phone, Mail, Facebook, Instagram, Youtube } from "react-feather";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-10 pb-4 px-4">
      {/* Top section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 pb-8 border-b border-gray-700">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">DVFashion lắng nghe bạn!</h2>
          <p className="mb-4">
            Chúng tôi luôn trân trọng và mong đợi nhận được mọi ý kiến đóng góp
            từ khách hàng để có thể nâng cấp trải nghiệm dịch vụ và sản phẩm tốt
            hơn nữa.
          </p>
          <button className="bg-white text-black font-bold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition mb-4 cursor-pointer">
            ĐÓNG GÓP Ý KIẾN &rarr;
          </button>
        </div>
        <div className="flex flex-col gap-2 min-w-[260px]">
          <div className="flex items-center gap-2">
            <Phone className="text-2xl" size={30} />
            <span>
              <span className="font-bold">Hotline</span>
              <br />
              0xxx 309 xxx
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Mail className="text-2xl" size={30} />
            <span>
              <span className="font-bold">Email</span>
              <br />
              Dvfashion@dvfashion.me
            </span>
          </div>
          <div className="flex gap-4 mt-4">
            <a href="#" aria-label="Facebook">
              <Facebook className="h-12" />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram className="h-12" />
            </a>
            <a href="#" aria-label="YouTube">
              <Youtube className="h-12" />
            </a>
          </div>
        </div>
      </div>

      {/* Links section */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-6 py-8 text-sm">
        <div>
          <h3 className="font-bold mb-2">DVFASHIONCLUB</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Tài khoản DvfashionClub
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Đăng kí thành viên
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Ưu đãi & Đặc quyền
              </a>
            </li>
          </ul>
          <h3 className="font-bold mt-4 mb-2">TÀI LIỆU - TUYỂN DỤNG</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Tuyển dụng
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Đăng ký bản quyền
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">CHÍNH SÁCH</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Chính sách đổi trả 60 ngày
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Chính sách khuyến mãi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Chính sách giao hàng
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">CHĂM SÓC KHÁCH HÀNG</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Trải nghiệm mua sắm 100% hài lòng
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Hỏi đáp - FAQs
              </a>
            </li>
          </ul>
          <h3 className="font-bold mt-4 mb-2">KIẾN THỨC MẶC ĐẸP</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Hướng dẫn chọn size
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Blog
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">DVFashion.ME</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Lịch sử thay đổi website
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">VỀ DVFashion</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Quy tắc ứng xử của DVFashion
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                DVFashion 101
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                DVKH xuất sắc
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Câu chuyện về DVFashion
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Nhà máy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Care & Share
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Cam kết bền vững
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                Tầm nhìn 2030
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">ĐỊA CHỈ LIÊN HỆ</h3>
          <span className="text-sm">
            {" "}
            12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP HCM
          </span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2 pt-6">
        <div className="text-xs text-gray-400 text-center mb-2">
          © 2025 DVFashion. Bản quyền thuộc về Nguyễn Tấn Thái Dương và Trần
          Hiển Vinh
          <br />
          Trường: Đại học Công Nghiệp TP HCM - Khoa Công Nghệ Thông Tin
        </div>
      </div>
    </footer>
  );
}
