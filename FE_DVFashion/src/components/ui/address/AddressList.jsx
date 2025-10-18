import { useState } from "react";
import {
  IconMapPin,
  IconEdit,
  IconTrash,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useAddress } from "../../../hooks/useAddress";
import AddressModal from "./AddressModal";
import { showConfirmationToast } from "../../../utils/showConfirmationToast";

export default function AddressList({
  isOpen,
  onClose,
  onSelectAddress,
  selectedAddressId = null,
}) {
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

  const handleSave = (addressData) => {
    if (editingAddress) {
      updateAddress({ id: editingAddress.id, addressData });
    } else {
      createAddress(addressData);
    }
    setShowModal(false);
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

  const formatAddress = (address) => {
    return `${address.street}, ${address.ward}, ${address.city}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <IconMapPin size={20} />
              {t("address.address_book")}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm cursor-pointer"
              >
                <IconPlus size={16} />
                {t("address.add_new")}
              </button>
              <button
                onClick={onClose}
                className="bg-black/20 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/30 cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                {t("common.loading")}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <IconMapPin size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">
                  {t("address.empty_message")}
                </p>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t("address.add_first")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => onSelectAddress(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {address.fullName}
                          </span>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-600">{address.phone}</span>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {t("address.default")}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {formatAddress(address)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(address);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(address);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
