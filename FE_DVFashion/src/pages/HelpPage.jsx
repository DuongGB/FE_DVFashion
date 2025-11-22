import { useTranslation } from "react-i18next";

export default function HelpPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 bg-white/70 rounded-3xl shadow-xl mt-8 mb-12">
      <h1 className="text-4xl font-extrabold mb-6 text-blue-700 text-center drop-shadow">
        {t("customer_support.customer_support", "Customer Support")}
      </h1>
      <p className="mb-8 text-gray-700 text-center text-lg">
        {t(
          "footer.feedback_desc",
          "We always value and look forward to receiving all feedback from customers to improve service and product experience even better."
        )}
      </p>
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-black">
          {t("footer.customer_service_title", "CUSTOMER SERVICE")}
        </h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-gray-800">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
            {t(
              "footer.customer_service_experience",
              "100% Satisfaction Shopping Experience"
            )}
          </li>
          <li className="flex items-center gap-2 text-gray-800">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
            {t("footer.customer_service_faq", "FAQs")}
          </li>
          <li className="flex items-center gap-2 text-gray-800">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
            <span className="font-semibold">
              {t("footer.hotline", "Hotline")}:
            </span>{" "}
            1900.27.27.37
          </li>
          <li className="flex items-center gap-2 text-gray-800">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
            <span className="font-semibold">
              {t("footer.email", "Email")}:
            </span>{" "}
            dvfashion@gmail.com
          </li>
        </ul>
      </div>
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-black">
          {t("footer.policy_title", "POLICIES")}
        </h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-gray-800">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
            {t("footer.policy_return", "60-day Return Policy")}
          </li>
          <li className="flex items-center gap-2 text-gray-800">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
            {t("footer.policy_promotion", "Promotion Policy")}
          </li>
          <li className="flex items-center gap-2 text-gray-800">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
            {t("footer.policy_privacy", "Privacy Policy")}
          </li>
          <li className="flex items-center gap-2 text-gray-800">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
            {t("footer.policy_shipping", "Shipping Policy")}
          </li>
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-black">
          {t("footer.contact_title", "CONTACT ADDRESS")}
        </h2>
        <div className="flex items-center gap-2 text-gray-800">
          <span className="inline-block w-2 h-2 bg-purple-500 rounded-full" />
          <span>
            {t(
              "footer.contact_address",
              "12 Nguyen Van Bao, Ward 4, Go Vap District, Ho Chi Minh City"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
