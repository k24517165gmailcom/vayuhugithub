import React, { useState, useEffect, useRef } from "react";

const EditSpaceMasterModal = ({ space, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    space_code: "",
    space: "",
    per_hour: "",
    per_day: "",
    one_week: "",
    two_weeks: "",
    three_weeks: "",
    per_month: "",
    min_duration: "",
    min_duration_desc: "",
    max_duration: "",
    max_duration_desc: "",
    status: "Active",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load data
  useEffect(() => {
    if (space) {
      setFormData({
        space_code: space.space_code || "",
        space: space.space || "",
        per_hour: space.per_hour || "",
        per_day: space.per_day || "",
        one_week: space.one_week || "",
        two_weeks: space.two_weeks || "",
        three_weeks: space.three_weeks || "",
        per_month: space.per_month || "",
        min_duration: space.min_duration || "",
        min_duration_desc: space.min_duration_desc || "",
        max_duration: space.max_duration || "",
        max_duration_desc: space.max_duration_desc || "",
        status: space.status || "Active",
      });

      setPreview(space.image_url || null);
    }
  }, [space]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    let file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updated = { ...formData };
    if (imageFile) updated.image = imageFile;

    onSave(updated);
  };

  if (!space) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-3 bg-orange-50">
          <h2 className="text-lg font-semibold text-gray-700">Edit Space Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-orange-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >

          {/* Image Upload */}
          <div className="col-span-1 md:row-span-2 flex flex-col items-center">
            <div
              onClick={handleImageClick}
              className="relative w-32 h-32 rounded-lg border-2 border-orange-400 flex items-center justify-center bg-gray-50 text-gray-400 text-5xl cursor-pointer hover:opacity-80 transition"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                "🖼️"
              )}
              <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs rounded px-1.5 py-0.5 shadow-md">
                Edit
              </div>
            </div>

            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
            />

            <p className="text-xs text-gray-500 mt-1">Click to change image</p>
          </div>

          {/* Space Code */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Space Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="space_code"
              value={formData.space_code}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
              required
            />
          </div>

          {/* Space Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Space Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="space"
              value={formData.space}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
              required
            />
          </div>

          {/* Per Hour */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Per Hour</label>
            <input
              type="number"
              name="per_hour"
              value={formData.per_hour}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Per Day */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Per Day</label>
            <input
              type="number"
              name="per_day"
              value={formData.per_day}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* One Week */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">One Week</label>
            <input
              type="number"
              name="one_week"
              value={formData.one_week}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Two Weeks */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Two Weeks</label>
            <input
              type="number"
              name="two_weeks"
              value={formData.two_weeks}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Three Weeks */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Three Weeks</label>
            <input
              type="number"
              name="three_weeks"
              value={formData.three_weeks}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Per Month */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Per Month</label>
            <input
              type="number"
              name="per_month"
              value={formData.per_month}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Min Duration */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Min Duration</label>
            <input
              type="number"
              name="min_duration"
              value={formData.min_duration}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Min Duration Description */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Min Duration Description
            </label>
            <input
              type="text"
              name="min_duration_desc"
              value={formData.min_duration_desc}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Max Duration */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Max Duration</label>
            <input
              type="number"
              name="max_duration"
              value={formData.max_duration}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Max Duration Description */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Max Duration Description
            </label>
            <input
              type="text"
              name="max_duration_desc"
              value={formData.max_duration_desc}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="col-span-1 md:col-span-3 flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditSpaceMasterModal;
