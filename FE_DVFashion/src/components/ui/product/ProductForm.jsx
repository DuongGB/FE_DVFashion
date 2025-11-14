import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCurrencyDollar,
  IconDiscount,
  IconFileText,
  IconPackage,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useProduct } from "../../../hooks/useProduct";
import { useProductVariant } from "../../../hooks/useProductVariant";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { sizeAPI } from "../../../services/sizeAPI";
import { productVariantImageAPI } from "../../../services/productVariantImageAPI";

const ProductForm = ({
  isOpen,
  onClose,
  product = null,
  // brands = [],
  categories = [],
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";
  const queryClient = useQueryClient();

  const { createProduct, isCreating, updateProduct, isUpdating } =
    useProduct(language);
  const { addVariant, isAddingVariant, updateVariant, isUpdatingVariant } =
    useProductVariant(product?.id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    material: "",
    salePrice: "",
    onSale: false,
    status: "ACTIVE",
    // brandId: "",
    categoryId: "",
    promotionId: "",
    variants: [],
  });

  const [errors, setErrors] = useState({});
  const [showVariants, setShowVariants] = useState(false);
  const [isProcessingVariants, setIsProcessingVariants] = useState(false);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        material: product.material || "",
        salePrice: product.salePrice || "",
        onSale: product.onSale || false,
        status: product.status || "ACTIVE",
        // brandId: product.brandId || "",
        categoryId: product.categoryId || "",
        promotionId: product.promotionId || "",
        variants: product.variants
          ? product.variants.map((v) => ({
              id: v.id || null,
              color: v.color || "",
              additionalPrice: v.additionalPrice || 0,
              status: v.status || "ACTIVE",
              sizes: v.sizes
                ? v.sizes.map((s) => ({
                    id: s.id || null,
                    sizeName: s.sizeName || "",
                  }))
                : [
                    {
                      id: null,
                      sizeName: "",
                    },
                  ],
              images: v.images
                ? v.images.map((img) => ({
                    id: img.id || null,
                    isPrimary: img?.isPrimary || false,
                    imageFile: null,
                    preview: img?.imageUrl || "",
                    existingImageUrl: img.imageUrl || "",
                  }))
                : [],
            }))
          : [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        material: "",
        salePrice: "",
        onSale: false,
        status: "ACTIVE",
        // brandId: "",
        categoryId: "",
        promotionId: "",
        variants: [],
      });
    }
    setErrors({});
  }, [product, isOpen]);

  // Add variant
  const handleVariantAdd = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: null,
          color: "",
          additionalPrice: 0,
          status: "ACTIVE",
          sizes: [
            {
              id: null,
              sizeName: "",
            },
          ],
          images: [],
        },
      ],
    }));
  };

  // Remove variant
  const handleVariantRemove = (idx) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants.splice(idx, 1);
      return { ...prev, variants };
    });
  };

  // Update variant field
  const handleVariantChange = (idx, field, value) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      const variant = variants[idx];

      if (variant[field] !== value) {
        variants[idx] = {
          ...variant,
          [field]: value,
          isModified: variant.id ? true : variant.isModified,
        };
      }

      return { ...prev, variants };
    });
  };

  // Add size to variant
  const handleSizeAdd = (variantIdx, e) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[variantIdx].sizes.push({
        id: null,
        sizeName: "",
      });
      return { ...prev, variants };
    });
    e.target.value = "";
  };

  // Remove size from variant
  const handleSizeRemove = (variantIdx, sizeIdx) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[variantIdx].sizes.splice(sizeIdx, 1);
      return { ...prev, variants };
    });
  };

  // Update size field
  const handleSizeChange = (variantIdx, sizeIdx, field, value) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      const size = variants[variantIdx].sizes[sizeIdx];

      if (size[field] !== value) {
        variants[variantIdx].sizes[sizeIdx] = {
          ...size,
          [field]: value,
          isModified: size.id && !size.isNew ? true : size.isModified,
        };
      }

      return { ...prev, variants };
    });
  };

  // Thêm ảnh cho variant
  const handleImageAdd = (variantIdx, e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => {
      const variants = [...prev.variants];
      const isFirstImage = variants[variantIdx].images.length === 0;

      // Tạo mảng mới, không dùng push
      const newImages = files.map((file, i) => ({
        id: null,
        isPrimary: isFirstImage && i === 0,
        imageFile: file,
        preview: URL.createObjectURL(file),
        existingImageUrl: null,
        isNew: true,
        isModified: false,
      }));

      // Gán lại mảng images mới
      variants[variantIdx] = {
        ...variants[variantIdx],
        images: [...variants[variantIdx].images, ...newImages],
      };

      return { ...prev, variants };
    });
    e.target.value = "";
  };

  // Xóa ảnh của variant
  const handleImageRemove = (variantIdx, imgIdx) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      const images = [...variants[variantIdx].images];
      const removedImage = images[imgIdx];

      if (removedImage?.preview && removedImage.imageFile) {
        URL.revokeObjectURL(removedImage.preview);
      }

      const wasPrimary = removedImage?.isPrimary;
      images.splice(imgIdx, 1);

      // Nếu ảnh bị xóa là primary, gán ảnh đầu tiên còn lại làm primary
      if (wasPrimary && images.length > 0) {
        images[0].isPrimary = true;
        if (images[0].id) {
          images[0].isModified = true;
        }
      }

      variants[variantIdx] = {
        ...variants[variantIdx],
        images,
      };

      return { ...prev, variants };
    });
  };

  // Set primary image
  const handleSetPrimaryImage = (variantIdx, imgIdx) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[variantIdx].images = variants[variantIdx].images.map(
        (img, i) => ({
          ...img,
          isPrimary: i === imgIdx,
          isModified:
            img.id && img?.isPrimary !== (i === imgIdx) ? true : img.isModified,
        })
      );
      return { ...prev, variants };
    });
  };

  // Handle common field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      // Nếu thay đổi salePrice và có giá trị > 0 thì onSale = true
      if (name === "salePrice") {
        const salePriceValue = value && parseFloat(value) > 0 ? value : "";
        return {
          ...prev,
          salePrice: salePriceValue,
          onSale:
            salePriceValue && parseFloat(salePriceValue) > 0
              ? true
              : prev.onSale,
        };
      }
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Basic product validation
    if (!formData.name.trim())
      newErrors.name = t("admin.product.validation.name_required");
    if (!formData.price || formData.price <= 0)
      newErrors.price = t("admin.product.validation.price_required");
    // if (!formData.material.trim())
    //   newErrors.material = t("admin.product.validation.material_required");
    if (!formData.status)
      newErrors.status = t("admin.product.validation.status_required");
    if (!formData.categoryId)
      newErrors.categoryId = t("admin.product.validation.category_required");
    // if (!formData.brandId)
    //   newErrors.brandId = t("admin.product.validation.brand_required");

    // Variant validation
    if (!formData.variants.length)
      newErrors.variants = t("admin.product.validation.variants_required");

    formData.variants.forEach((variant, idx) => {
      if (!variant.color.trim())
        newErrors[`variant_${idx}_color`] = t(
          "admin.product.validation.color_required"
        );

      if (!variant.sizes.length)
        newErrors[`variant_${idx}_sizes`] = t(
          "admin.product.validation.sizes_required"
        );

      if (!variant.images.length)
        newErrors[`variant_${idx}_images`] = t(
          "admin.product.validation.images_required"
        );

      variant.sizes.forEach((size, sidx) => {
        if (!size.sizeName.trim())
          newErrors[`variant_${idx}_size_${sidx}_sizeName`] = t(
            "admin.product.validation.size_name_required"
          );
      });

      const hasPrimaryImage = variant.images.some((img) => img?.isPrimary);
      if (variant.images.length > 0 && !hasPrimaryImage) {
        variant.images[0].isPrimary = true;
        if (variant.images[0].id) {
          variant.images[0].isModified = true;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Xử lý cập nhật/thêm mới các biến thể (variant), size và ảnh cho sản phẩm.
   * - Nếu variant mới: gọi addVariant (bao gồm size và ảnh).
   * - Nếu variant đã tồn tại:
   *    + Nếu variant thay đổi: gọi updateVariant.
   *    + Xử lý từng size: nếu size mới thì addSize, nếu đã có thì updateSize.
   *    + Xử lý từng ảnh: nếu mới thì addImageToVariant, nếu thay đổi thì updateVariantImage.
   */
  const processVariantUpdates = async () => {
    setIsProcessingVariants(true);

    try {
      for (const [variantIndex, variant] of formData.variants.entries()) {
        if (variant.isNew) {
          // Tạo mới variant cùng size và ảnh
          const variantRequest = {
            color: variant.color,
            additionalPrice: parseFloat(variant.additionalPrice) || 0,
            status: variant.status,
            sizes: variant.sizes.map((s) => ({
              sizeName: s.sizeName,
            })),
            images: variant.images.map((img) => ({
              isPrimary: Boolean(img?.isPrimary),
            })),
          };

          const imageFiles = variant.images
            .filter((img) => img.imageFile)
            .map((img) => img.imageFile);

          await addVariant({
            variant: variantRequest,
            images: imageFiles,
          });
        } else {
          // Variant đã tồn tại
          if (variant.isModified) {
            await updateVariant({
              variantId: variant.id,
              variant: {
                color: variant.color,
                additionalPrice: parseFloat(variant.additionalPrice) || 0,
                status: variant.status,
              },
            });
          }

          // Xử lý size cho variant này
          await processSizesForVariant(variant);

          // Xử lý ảnh cho variant này
          await processImagesForVariant(variant, variantIndex);
        }
      }
    } catch (error) {
      console.error("Error processing variants:", error);
      throw error;
    } finally {
      setIsProcessingVariants(false);
    }
  };

  /**
   * Thêm/cập nhật size cho một variant.
   * - Nếu size mới (chưa có id): gọi addSize.
   * - Nếu size đã có id: gọi updateSize.
   */
  const processSizesForVariant = async (variant) => {
    if (!variant.id) return;
    for (const size of variant.sizes || []) {
      if (!size.id) {
        await sizeAPI.addSize(variant.id, {
          sizeName: size.sizeName,
        });
      } else {
        await sizeAPI.updateSize(variant.id, size.id, {
          sizeName: size.sizeName,
        });
      }
    }
  };

  /**
   * Thêm/cập nhật ảnh cho một variant sử dụng hook useProductVariantImage.
   * - Nếu ảnh mới (isNew): gọi addImage.
   * - Nếu ảnh đã có và thay đổi (isModified): gọi updateImage.
   */
  const processImagesForVariant = async (variant) => {
    if (!variant.id) return;
    for (const image of variant.images || []) {
      if (image.isNew && image.imageFile) {
        await productVariantImageAPI.addImageToVariant(
          variant.id,
          { isPrimary: Boolean(image?.isPrimary) },
          image.imageFile
        );
      } else if (image.isModified && image.id) {
        await productVariantImageAPI.updateVariantImage(
          variant.id,
          image.id,
          { isPrimary: Boolean(image?.isPrimary) },
          null
        );
      }
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      material: formData.material,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      onSale: Boolean(formData.onSale),
      status: formData.status,
      categoryId: parseInt(formData.categoryId),
      // brandId: parseInt(formData.brandId),
      promotionId: formData.promotionId ? parseInt(formData.promotionId) : null,
    };

    try {
      if (product) {
        await updateProduct({
          productId: product.id,
          productData,
        });
        await processVariantUpdates();
        toast.success(t("admin.product.messages.update_success"));
      } else {
        // Tạo mới sản phẩm cùng các biến thể
        const createProductData = {
          ...productData,
          variants: formData.variants.map((v) => ({
            color: v.color,
            additionalPrice: parseFloat(v.additionalPrice) || 0,
            status: v.status,
            sizes: v.sizes.map((s) => ({
              sizeName: s.sizeName,
            })),
            images: v.images.map((img) => ({
              isPrimary: Boolean(img?.isPrimary),
            })),
          })),
        };

        // Tập hợp tất cả ảnh từ các biến thể
        const variantImages = [];
        formData.variants.forEach((variant) => {
          variant.images.forEach((img) => {
            if (img.imageFile) {
              variantImages.push(img.imageFile);
            }
          });
        });
        await createProduct({
          productData: createProductData,
          variantImages,
        });
        toast.success(t("admin.product.messages.create_success"));
      }
      if (onSuccess) onSuccess();
      else onClose();
      onClose();
    } catch (error) {
      let errorMessage;
      if (error.message && error.message.includes("Failed to process")) {
        errorMessage = `${
          product
            ? t("admin.product.messages.update_error")
            : t("admin.product.messages.create_error")
        } ${error.message}`;
      } else {
        errorMessage = product
          ? t("admin.product.messages.update_error")
          : t("admin.product.messages.create_error");
      }
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  const isSubmitting =
    isCreating ||
    isUpdating ||
    isAddingVariant ||
    isUpdatingVariant ||
    isProcessingVariants;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col transition-all duration-300 animate-scaleIn"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <IconPackage size={28} className="text-white" />
            <h2 className="text-2xl font-bold">
              {product
                ? t("admin.product.form.edit_title")
                : t("admin.product.form.create_title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessingVariants && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-700">
                {language === "VI"
                  ? "Đang xử lý biến thể, kích cỡ và hình ảnh..."
                  : "Processing variants, sizes and images..."}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-2 space-y-2 flex-1 overflow-y-auto"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Product Name */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.product.form.name")} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.name ? "border-red-500" : "border-white/30"
                } bg-white/80 backdrop-blur-sm`}
                placeholder={t("admin.product.form.name_placeholder")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Material */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.product.form.material")} *
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.material ? "border-red-500" : "border-white/30"
                } bg-white/80 backdrop-blur-sm`}
                placeholder={t("admin.product.form.material_placeholder")}
              />
              {errors.material && (
                <p className="text-red-500 text-sm mt-1">{errors.material}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconFileText size={16} className="inline mr-1" />
              {t("admin.product.form.description")}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
              className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
              placeholder={t("admin.product.form.description_placeholder")}
            />
          </div>

          {/* Price and Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Original Price */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconCurrencyDollar size={16} className="inline mr-1" />
                {t("admin.product.form.price")} *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={isSubmitting}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.price ? "border-red-500" : "border-white/30"
                } bg-white/80 backdrop-blur-sm`}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Sale Price */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconDiscount size={16} className="inline mr-1" />
                {t("admin.product.form.sale_price")}
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                disabled={isSubmitting}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                placeholder="0"
              />
            </div>

            {/* Category */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.product.form.category")} *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.categoryId ? "border-red-500" : "border-white/30"
                } bg-white/80 backdrop-blur-sm`}
              >
                <option value="">
                  {t("admin.product.form.select_category")}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>
          </div>

          {/* Variants Section */}
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
            <button
              type="button"
              onClick={() => setShowVariants(!showVariants)}
              disabled={isSubmitting}
              className="flex items-center justify-between w-full px-4 py-2 border border-white/30 rounded-lg hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <IconPackage size={16} />
                <span>
                  {t("admin.product.form.variant")} ({formData.variants.length})
                  *
                </span>
              </div>
              {showVariants ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </button>

            {errors.variants && (
              <p className="text-red-500 text-sm mt-1">{errors.variants}</p>
            )}

            {showVariants && (
              <div className="mt-3 space-y-4">
                <button
                  type="button"
                  onClick={handleVariantAdd}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconPlus size={16} />
                  {t("admin.product.form.add_variant")}
                </button>

                {formData.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="border border-white/30 rounded-lg p-4 bg-white/80 backdrop-blur-sm"
                  >
                    {/* Variant Header */}
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-700">
                        {t("admin.product.form.variant")} #{idx + 1}
                        {variant.isNew && (
                          <span className="text-xs text-green-500 ml-2">
                            (NEW)
                          </span>
                        )}
                        {variant.isModified && (
                          <span className="text-xs text-blue-500 ml-2">
                            (MODIFIED)
                          </span>
                        )}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleVariantRemove(idx)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t("admin.product.form.remove_variant")}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>

                    {/* Variant Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <input
                          type="text"
                          placeholder={t("admin.product.form.color") + " *"}
                          value={variant.color}
                          onChange={(e) =>
                            handleVariantChange(idx, "color", e.target.value)
                          }
                          disabled={isSubmitting}
                          className={`w-full px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors[`variant_${idx}_color`]
                              ? "border-red-500"
                              : "border-white/30"
                          } bg-white/80 backdrop-blur-sm`}
                        />
                        {errors[`variant_${idx}_color`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`variant_${idx}_color`]}
                          </p>
                        )}
                      </div>

                      <input
                        type="number"
                        placeholder={t("admin.product.form.additional_price")}
                        value={variant.additionalPrice}
                        onChange={(e) =>
                          handleVariantChange(
                            idx,
                            "additionalPrice",
                            e.target.value
                          )
                        }
                        disabled={isSubmitting}
                        min="0"
                        step="1000"
                        className="px-3 py-2 border border-white/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                      />

                      <select
                        value={variant.status}
                        onChange={(e) =>
                          handleVariantChange(idx, "status", e.target.value)
                        }
                        disabled={isSubmitting}
                        className="px-3 py-2 border border-white/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                      >
                        <option value="ACTIVE">
                          {t("admin.product.form.active")}
                        </option>
                        <option value="INACTIVE">
                          {t("admin.product.form.inactive")}
                        </option>
                        <option value="DISCONTINUED">
                          {t("admin.product.form.discontinued")}
                        </option>
                      </select>
                    </div>

                    {/* Sizes Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-600">
                          {t("admin.product.form.sizes")} *
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSizeAdd(idx)}
                          disabled={isSubmitting}
                          className="text-blue-500 hover:text-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + {t("admin.product.form.add_size")}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {variant.sizes.map((size, sidx) => (
                          <div key={sidx} className="flex gap-2 items-center">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder={t("admin.product.form.size_name")}
                                value={size.sizeName}
                                onChange={(e) =>
                                  handleSizeChange(
                                    idx,
                                    sidx,
                                    "sizeName",
                                    e.target.value
                                  )
                                }
                                disabled={isSubmitting}
                                className={`w-full px-2 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                                  errors[`variant_${idx}_size_${sidx}_sizeName`]
                                    ? "border-red-500"
                                    : "border-white/30"
                                } bg-white/80 backdrop-blur-sm`}
                              />
                              {errors[
                                `variant_${idx}_size_${sidx}_sizeName`
                              ] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {
                                    errors[
                                      `variant_${idx}_size_${sidx}_sizeName`
                                    ]
                                  }
                                </p>
                              )}
                            </div>

                            {variant.sizes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleSizeRemove(idx, sidx)}
                                disabled={isSubmitting}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={t("admin.product.form.remove_size")}
                              >
                                <IconTrash size={14} />
                              </button>
                            )}

                            <div className="flex flex-col text-xs text-gray-500">
                              {size.id && <span>(ID: {size.id})</span>}
                              {size.isNew && (
                                <span className="text-green-500">(NEW)</span>
                              )}
                              {size.isModified && (
                                <span className="text-blue-500">(MOD)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {errors[`variant_${idx}_sizes`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`variant_${idx}_sizes`]}
                        </p>
                      )}
                    </div>

                    {/* Images Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <IconPhoto size={16} />
                        <span className="font-medium text-gray-600">
                          {t("admin.product.form.images")} *
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageAdd(idx, e)}
                          disabled={isSubmitting}
                          className="ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {variant.images.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-2">
                          {variant.images.filter(Boolean).map((img, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative group w-20 h-20 border border-white/30 rounded-lg bg-white/80 backdrop-blur-sm"
                            >
                              <img
                                src={img?.preview || img?.existingImageUrl}
                                alt=""
                                className="w-full h-full object-cover rounded-lg"
                              />
                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleImageRemove(idx, imgIdx)}
                                disabled={isSubmitting}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <IconX size={12} />
                              </button>
                              {/* Primary Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetPrimaryImage(idx, imgIdx)
                                }
                                disabled={isSubmitting}
                                className={`absolute bottom-1 left-1 px-1 py-0.5 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                                  img?.isPrimary
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {img?.isPrimary
                                  ? t("admin.product.form.primary")
                                  : t("admin.product.form.set_primary")}
                              </button>
                              {/* Status Indicators */}
                              <div className="absolute top-1 left-1 flex flex-col text-xs">
                                {img.id && (
                                  <span className="bg-blue-500 text-white px-1 rounded">
                                    {img.id}
                                  </span>
                                )}
                                {img.isNew && (
                                  <span className="bg-green-500 text-white px-1 rounded mt-1">
                                    NEW
                                  </span>
                                )}
                                {img.isModified && (
                                  <span className="bg-blue-500 text-white px-1 rounded mt-1">
                                    MOD
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {errors[`variant_${idx}_images`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`variant_${idx}_images`]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status & Sale Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-lg border border-white/30">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="onSale"
                  checked={formData.onSale}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <IconDiscount size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t("admin.product.form.on_sale")}
                </span>
              </label>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-lg border border-white/30">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.product.form.status")}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
              >
                <option value="ACTIVE">{t("admin.product.form.active")}</option>
                <option value="INACTIVE">
                  {t("admin.product.form.inactive")}
                </option>
                <option value="DISCONTINUED">
                  {t("admin.product.form.discontinued")}
                </option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-3 border-t border-white/30">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isProcessingVariants
                    ? language === "VI"
                      ? "Đang xử lý..."
                      : "Processing..."
                    : language === "VI"
                    ? "Đang lưu..."
                    : "Saving..."}
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  {product
                    ? t("admin.product.form.submit_update")
                    : t("admin.product.form.submit_create")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
