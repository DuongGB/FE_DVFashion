import React from "react";
import { Phone, Mail, Facebook, Instagram, Youtube } from "react-feather";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-black text-white pt-10 pb-4 px-4">
      {/* Top section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 pb-8 border-b border-gray-700">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">
            {t("footer.feedback_title")}
          </h2>
          <p className="mb-4">{t("footer.feedback_desc")}</p>
          <button className="bg-white text-black font-bold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition mb-4 cursor-pointer">
            {t("footer.feedback_button")} &rarr;
          </button>
        </div>
        <div className="flex flex-col gap-2 min-w-[260px]">
          <div className="flex items-center gap-2">
            <Phone className="text-2xl" size={30} />
            <span>
              <span className="font-bold">{t("footer.hotline")}</span>
              <br />
              0xxx 309 xxx
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Mail className="text-2xl" size={30} />
            <span>
              <span className="font-bold">{t("footer.email")}</span>
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
          <h3 className="font-bold mb-2">{t("footer.club_title")}</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.club_account")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.club_register")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.club_benefits")}
              </a>
            </li>
          </ul>
          <h3 className="font-bold mt-4 mb-2">{t("footer.docs_title")}</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.docs_recruitment")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.docs_copyright")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">{t("footer.policy_title")}</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.policy_return")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.policy_promotion")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.policy_privacy")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.policy_shipping")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">
            {t("footer.customer_service_title")}
          </h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.customer_service_experience")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.customer_service_faq")}
              </a>
            </li>
          </ul>
          <h3 className="font-bold mt-4 mb-2">
            {t("footer.style_guide_title")}
          </h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.style_guide_size")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.style_guide_blog")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">{t("footer.website_title")}</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.website_history")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">{t("footer.about_title")}</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.about_code_of_conduct")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 leading-7">
                {t("footer.about_story")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">{t("footer.contact_title")}</h3>
          <span className="text-sm">{t("footer.contact_address")}</span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2 pt-6">
        <div className="text-xs text-gray-400 text-center mb-2">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
