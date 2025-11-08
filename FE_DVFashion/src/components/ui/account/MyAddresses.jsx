import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { useAddress } from "../../../hooks/useAddress";
import AddressModal from "../address/AddressModal";
import { showConfirmationToast } from "../../../utils/showConfirmationToast";

export default function MyAddresses() {
  const { t } = useTranslation();
  const {
    addresses = [],
    isLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    createAddressLoading,
    updateAddressLoading,
  } = useAddress();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleDelete = (address) => {
    showConfirmationToast({
      title: t("address.confirm_delete_title"),
      message: t("address.confirm_delete_message", {
        fullName: address.fullName,
      }),
      onConfirm: () => deleteAddress(address.id),
    });
  };

  const handleSave = (addressData) => {
    if (editingAddress) {
      updateAddress({ id: editingAddress.id, addressData });
    } else {
      createAddress(addressData);
    }
    setShowModal(false);
  };

  const formatAddress = (address) => {
    return `${address.street}, ${address.ward}, ${address.city}`;
  };

  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-100/60 via-white/60 to-blue-200/60 p-6 rounded-3xl shadow-2xl backdrop-blur-lg">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold mb-2 drop-shadow">
            {t("address.address_book_title")}
          </h2>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-black text-white font-bold rounded-full px-4 py-2 text-lg hover:opacity-90 transition cursor-pointer"
          >
            <IconPlus size={24} />
            {t("address.add_new")}
          </button>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              {t("common.loading")}
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-gray-500 text-lg mb-4">
                {t("address.empty_message")}
              </p>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-black text-white rounded-full font-bold text-lg cursor-pointer hover:opacity-90 transition"
              >
                <IconPlus size={20} className="inline mr-2" />
                {t("address.add_first")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-white/40 backdrop-blur-md rounded-2xl p-6 flex items-center justify-between shadow-lg border border-white/30 transition hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">
                        {address.fullName}
                      </span>
                      <span className="text-gray-500">{address.phone}</span>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {t("address.default")}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600">
                      {formatAddress(address)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(address)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AddressModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        editAddress={editingAddress}
        isLoading={createAddressLoading || updateAddressLoading}
      />
    </>
  );
}
