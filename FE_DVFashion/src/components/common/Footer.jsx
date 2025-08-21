import React from "react";
import {
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  ArrowUp,
  MessageCircle,
} from "react-feather";

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
          <button className="bg-white text-black font-bold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition mb-4">
            ĐÓNG GÓP Ý KIẾN &rarr;
          </button>
        </div>
        <div className="flex flex-col gap-2 min-w-[260px]">
          <div className="flex items-center gap-2">
            <Phone className="text-2xl" size={30} />
            <span>
              <span className="font-bold">Hotline</span>
              <br />
              1900.272737 - 028.7777.2737
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="material-icons text-2xl">mail</span>
            <span>
              <span className="font-bold">Email</span>
              <br />
              Dvfashion@dvfashion.me
            </span>
          </div>
          <div className="flex gap-4 mt-4">
            <a href="#" aria-label="Facebook">
              <img src="/assets/facebook.svg" alt="Facebook" className="h-8" />
            </a>
            <a href="#" aria-label="Zalo">
              <img src="/assets/zalo.svg" alt="Zalo" className="h-8" />
            </a>
            <a href="#" aria-label="TikTok">
              <img src="/assets/tiktok.svg" alt="TikTok" className="h-8" />
            </a>
            <a href="#" aria-label="Instagram">
              <img
                src="/assets/instagram.svg"
                alt="Instagram"
                className="h-8"
              />
            </a>
            <a href="#" aria-label="YouTube">
              <img src="/assets/youtube.svg" alt="YouTube" className="h-8" />
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
              <a href="#" className="hover:underline">
                Tài khoản DvfashionClub
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Đăng kí thành viên
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Ưu đãi & Đặc quyền
              </a>
            </li>
          </ul>
          <h3 className="font-bold mt-4 mb-2">TÀI LIỆU - TUYỂN DỤNG</h3>
          <ul>
            <li>
              <a href="#" className="hover:underline">
                Tuyển dụng
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Đăng ký bản quyền
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">CHÍNH SÁCH</h3>
          <ul>
            <li>
              <a href="#" className="hover:underline">
                Chính sách đổi trả 60 ngày
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Chính sách khuyến mãi
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Chính sách giao hàng
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">CHĂM SÓC KHÁCH HÀNG</h3>
          <ul>
            <li>
              <a href="#" className="hover:underline">
                Trải nghiệm mua sắm 100% hài lòng
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Hỏi đáp - FAQs
              </a>
            </li>
          </ul>
          <h3 className="font-bold mt-4 mb-2">KIẾN THỨC MẶC ĐẸP</h3>
          <ul>
            <li>
              <a href="#" className="hover:underline">
                Hướng dẫn chọn size
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Blog
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">DVFashion.ME</h3>
          <ul>
            <li>
              <a href="#" className="hover:underline">
                Lịch sử thay đổi website
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">VỀ DVFashion</h3>
          <ul>
            <li>
              <a href="#" className="hover:underline">
                Quy tắc ứng xử của DVFashion
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                DVFashion 101
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                DVKH xuất sắc
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Câu chuyện về DVFashion
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Nhà máy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Care & Share
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Cam kết bền vững
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Tầm nhìn 2030
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">ĐỊA CHỈ LIÊN HỆ</h3>
          <ul>
            <li>
              <a href="#" className="hover:underline font-bold">
                Văn phòng Hà Nội:
              </a>{" "}
              Tầng 3-4, Tòa nhà BMM, Km2, Đường Phùng Hưng, Phường Hà Đông,
              Thành phố Hà Nội, Việt Nam
            </li>
            <li>
              <a href="#" className="hover:underline font-bold">
                Trung tâm vận hành Hà Nội:
              </a>{" "}
              Lô C8, KCN Lại Yên, Xã Lại Yên, Huyện Hoài Đức, Thành phố Hà Nội
            </li>
            <li>
              <a href="#" className="hover:underline font-bold">
                Văn phòng và Trung tâm vận hành TPHCM:
              </a>{" "}
              Lô C3, đường D2, KCN Cát Lái, Thành Mỹ Lợi, TP. Thủ Đức, TP. Hồ
              Chí Minh
            </li>
            <li>
              <a href="#" className="hover:underline font-bold">
                Trung tâm R&D:
              </a>{" "}
              T6-01, The Manhattan Vinhomes Grand Park, Long Bình, TP. Thủ Đức
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom section */}
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2 pt-6">
        <button
          className="bg-blue-600 text-white rounded-full p-3 mb-2 shadow-lg hover:bg-blue-700 transition"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="material-icons">keyboard_arrow_up</span>
        </button>
        <div className="text-xs text-gray-400 text-center mb-2">
          @ CÔNG TY TNHH FASTECH ASIA
          <br />
          Mã số doanh nghiệp: 0108617038. Giấy chứng nhận đăng ký doanh nghiệp
          do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu ngày 20/02/2019.
        </div>
        <div className="flex gap-2 justify-center items-center">
          <img src="/assets/ncsc.png" alt="NCSC" className="h-8" />
          <img src="/assets/dmca.png" alt="DMCA" className="h-8" />
          <img src="/assets/qr.png" alt="QR" className="h-8" />
          <img
            src="/assets/bocongthuong.png"
            alt="Bộ Công Thương"
            className="h-8"
          />
        </div>
      </div>
    </footer>
  );
}
