import React, { useState, useEffect } from "react";
import {
  IconX,
  IconPackage,
  IconTag,
  IconCurrencyDollar,
  IconFileText,
  IconPhoto,
  IconCheck,
  IconDiscount,
  IconStar,
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";

const ProductForm = ({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  brands = [],
  categories = [],
}) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    price: "",
    sale_price: "",
    on_sale: false,
    status: "active",
    brand_id: "",
    category_id: "",
    images: [],
    variants: [],
    specifications: [{ key: "", value: "" }],
  });

  const [errors, setErrors] = useState({});
  const [showVariants, setShowVariants] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState(false);

  // Load dữ liệu khi edit product
  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code || "",
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        sale_price: product.sale_price || "",
        on_sale: product.on_sale || false,
        status: product.status || "active",
        brand_id: product.brand_id || "",
        category_id: product.category_id || "",
        images: product.images || [],
        variants: product.variants || [],
        specifications: product.specifications || [{ key: "", value: "" }],
      });
    } else {
      // Reset form cho create mới
      setFormData({
        code: "",
        name: "",
        description: "",
        price: "",
        sale_price: "",
        on_sale: false,
        status: "active",
        brand_id: "",
        category_id: "",
        images: [],
        variants: [],
        specifications: [{ key: "", value: "" }],
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error khi user thay đổi
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Tự động set sale_price = price khi price thay đổi và chưa có sale_price
    if (name === "price" && !formData.sale_price) {
      setFormData((prev) => ({
        ...prev,
        sale_price: value,
      }));
    }
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      alt: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleImageRemove = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const handleVariantAdd = () => {
    const newVariant = {
      id: Date.now(),
      name: "",
      sku: "",
      price: formData.price,
      sale_price: formData.sale_price,
      stock: 0,
      attributes: [{ name: "", value: "" }],
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const handleVariantChange = (variantId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleVariantRemove = (variantId) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((variant) => variant.id !== variantId),
    }));
  };

  const handleVariantAttributeChange = (variantId, attrIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              attributes: variant.attributes.map((attr, index) =>
                index === attrIndex ? { ...attr, [field]: value } : attr
              ),
            }
          : variant
      ),
    }));
  };

  const handleVariantAttributeAdd = (variantId) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              attributes: [...variant.attributes, { name: "", value: "" }],
            }
          : variant
      ),
    }));
  };

  const handleVariantAttributeRemove = (variantId, attrIndex) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              attributes: variant.attributes.filter(
                (_, index) => index !== attrIndex
              ),
            }
          : variant
      ),
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
    }));
  };

  const handleSpecificationAdd = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const handleSpecificationRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Mã sản phẩm là bắt buộc";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Giá sản phẩm phải lớn hơn 0";
    }

    if (!formData.sale_price || formData.sale_price <= 0) {
      newErrors.sale_price = "Giá khuyến mãi phải lớn hơn 0";
    }

    if (
      formData.sale_price &&
      formData.price &&
      parseFloat(formData.sale_price) > parseFloat(formData.price)
    ) {
      newErrors.sale_price = "Giá khuyến mãi không được lớn hơn giá gốc";
    }

    if (!formData.brand_id) {
      newErrors.brand_id = "Thương hiệu là bắt buộc";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Danh mục là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Format data trước khi submit
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        sale_price: parseFloat(formData.sale_price),
        brand_id: parseInt(formData.brand_id),
        category_id: parseInt(formData.category_id),
        specifications: formData.specifications.filter(
          (spec) => spec.key && spec.value
        ),
        variants: formData.variants.map((variant) => ({
          ...variant,
          price: parseFloat(variant.price),
          sale_price: parseFloat(variant.sale_price),
          stock: parseInt(variant.stock),
          attributes: variant.attributes.filter(
            (attr) => attr.name && attr.value
          ),
        })),
      };
      onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <IconPackage size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {product ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black text-white rounded-full transition-colors cursor-pointer hover:bg-gray-800"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mã sản phẩm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconTag size={16} className="inline mr-1" />
                Mã sản phẩm *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="SP001"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>

            {/* Tên sản phẩm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconPackage size={16} className="inline mr-1" />
                Tên sản phẩm *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconFileText size={16} className="inline mr-1" />
              Mô tả sản phẩm
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả sản phẩm"
            />
          </div>

          {/* Giá và danh mục */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconCurrencyDollar size={16} className="inline mr-1" />
                Giá gốc *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconDiscount size={16} className="inline mr-1" />
                Giá khuyến mãi *
              </label>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.sale_price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.sale_price && (
                <p className="text-red-500 text-sm mt-1">{errors.sale_price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu *
              </label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brand_id ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brand_id && (
                <p className="text-red-500 text-sm mt-1">{errors.brand_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category_id ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category_id}
                </p>
              )}
            </div>
          </div>

          {/* Hình ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconPhoto size={16} className="inline mr-1" />
              Hình ảnh sản phẩm
            </label>
            <div className="space-y-3">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageAdd}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={image.id || index} className="relative group">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <IconX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          <div>
            <button
              type="button"
              onClick={() => setShowVariants(!showVariants)}
              className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IconPackage size={16} />
                <span>Biến thể sản phẩm ({formData.variants.length})</span>
              </div>
              {showVariants ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </button>

            {showVariants && (
              <div className="mt-3 space-y-4 border border-gray-200 rounded-md p-4">
                <button
                  type="button"
                  onClick={handleVariantAdd}
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                >
                  <IconPlus size={16} />
                  Thêm biến thể
                </button>

                {formData.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="border border-gray-200 rounded-md p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-700">
                        Biến thể #{variant.id}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleVariantRemove(variant.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Tên biến thể"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="SKU"
                        value={variant.sku}
                        onChange={(e) =>
                          handleVariantChange(variant.id, "sku", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Giá"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "price",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Tồn kho"
                        value={variant.stock}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "stock",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-600">
                          Thuộc tính
                        </label>
                        <button
                          type="button"
                          onClick={() => handleVariantAttributeAdd(variant.id)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          + Thêm thuộc tính
                        </button>
                      </div>
                      {variant.attributes.map((attr, attrIndex) => (
                        <div key={attrIndex} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Tên thuộc tính"
                            value={attr.name}
                            onChange={(e) =>
                              handleVariantAttributeChange(
                                variant.id,
                                attrIndex,
                                "name",
                                e.target.value
                              )
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Giá trị"
                            value={attr.value}
                            onChange={(e) =>
                              handleVariantAttributeChange(
                                variant.id,
                                attrIndex,
                                "value",
                                e.target.value
                              )
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleVariantAttributeRemove(
                                variant.id,
                                attrIndex
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div>
            <button
              type="button"
              onClick={() => setShowSpecifications(!showSpecifications)}
              className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IconFileText size={16} />
                <span>
                  Thông số kỹ thuật (
                  {
                    formData.specifications.filter((s) => s.key && s.value)
                      .length
                  }
                  )
                </span>
              </div>
              {showSpecifications ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </button>

            {showSpecifications && (
              <div className="mt-3 space-y-2 border border-gray-200 rounded-md p-4">
                <button
                  type="button"
                  onClick={handleSpecificationAdd}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <IconPlus size={16} />
                  Thêm thông số
                </button>

                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tên thông số"
                      value={spec.key}
                      onChange={(e) =>
                        handleSpecificationChange(index, "key", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Giá trị"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecificationChange(
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {formData.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleSpecificationRemove(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trạng thái */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="on_sale"
                  checked={formData.on_sale}
                  onChange={handleChange}
                  className="rounded"
                />
                <IconDiscount size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Đang khuyến mãi
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <IconCheck size={16} />
              {product ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
