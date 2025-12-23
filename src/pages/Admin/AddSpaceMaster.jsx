import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; // ✅ Imported Axios
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

export const SPACE_GROUPS = {
  Workspace: { prefix: "WS", max: 45 },
  "Team Leads Cubicle": { prefix: "TLC", max: 4 },
  "Manager Cubicle": { prefix: "MC", max: 2 },
  "Video Conferencing": { prefix: "VC", max: 1 },
  "Executive Cabin": { prefix: "EC", max: 2 },
  "CEO Cabin": { prefix: "CD", max: 1 },
};

const FIELD_LABELS = {
  space_code: "Space Code",
  space: "Space Type",
  per_hour: "Per Hour",
  per_day: "Per Day",
  per_month: "Per Month",
  one_week: "One Week",
  two_weeks: "Two Weeks",
  three_weeks: "Three Weeks",
  min_duration: "Min Duration",
  min_duration_desc: "Min Duration (text)",
  max_duration: "Max Duration",
  max_duration_desc: "Max Duration (text)",
  image: "Image",
};

const DEFAULT_FORM = {
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
};

const DEFAULT_PRICES = {
  Workspace: { per_hour: "100", per_day: "500", one_week: "4800", two_weeks: "5760", three_weeks: "7200", per_month: "4000", min_duration: "1", min_duration_desc: "1 Day", max_duration: "30", max_duration_desc: "30 Day" },
  "Team Leads Cubicle": { per_hour: "120", per_day: "600", one_week: "5760", two_weeks: "6912", three_weeks: "8640", per_month: "4500", min_duration: "1", min_duration_desc: "1 Day", max_duration: "30", max_duration_desc: "30 Day" },
  "Manager Cubicle": { per_hour: "120", per_day: "750", one_week: "7200", two_weeks: "8640", three_weeks: "10800", per_month: "6000", min_duration: "1", min_duration_desc: "1 Day", max_duration: "30", max_duration_desc: "30 Day" },
  "Video Conferencing": { per_hour: "100", per_day: "", one_week: "", two_weeks: "", three_weeks: "", per_month: "", min_duration: "1", min_duration_desc: "1 Hour", max_duration: "8", max_duration_desc: "8 Hour" },
  "Executive Cabin": { per_hour: "200", per_day: "1000", one_week: "", two_weeks: "", three_weeks: "", per_month: "15000", min_duration: "1", min_duration_desc: "1 Hour", max_duration: "8", max_duration_desc: "8 Hour" },
  "CEO Cabin": { per_hour: "500", per_day: "4000", one_week: "", two_weeks: "", three_weeks: "", per_month: "50000", min_duration: "1", min_duration_desc: "1 Hour", max_duration: "8", max_duration_desc: "8 Hour" },
};

const AddSpaceMaster = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [allCodes, setAllCodes] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [bulkImage, setBulkImage] = useState(null);

  // ✅ Retrieve Bearer Token
  const token = localStorage.getItem("token");

  // Fetch existing codes using Axios
  const fetchExistingCodes = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/get_spaces.php`);
      setAllCodes(res.data?.spaces?.map((s) => s.space_code).filter(Boolean) || []);
    } catch (err) {
      console.error(err);
      setAllCodes([]);
    }
  }, []);

  useEffect(() => {
    fetchExistingCodes();
  }, [fetchExistingCodes]);

  const generateNextCode = useCallback(
    (spaceName) => {
      const group = SPACE_GROUPS[spaceName];
      if (!group) return "";
      const { prefix, max } = group;

      const usedNumbers = allCodes
        .filter((c) => c.startsWith(prefix))
        .map((c) => Number(c.replace(prefix, "")))
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);

      let next = 1;
      for (const n of usedNumbers) {
        if (n === next) next++;
        else if (n > next) break;
      }

      return next > max ? "" : prefix + String(next).padStart(2, "0");
    },
    [allCodes]
  );

  const isPositiveNumber = (val) => val !== "" && !isNaN(val) && Number(val) >= 0;

  const handleInput = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "space") {
      const nextCode = generateNextCode(value);
      if (!nextCode && SPACE_GROUPS[value]) {
        toast.error(`${value} limit reached or auto-code unavailable`);
      }

      const defaults = DEFAULT_PRICES[value] || {};
      setForm((prev) => {
        const updated = { ...prev, space: value, space_code: nextCode || "" };
        for (const key of Object.keys(defaults)) {
          if (!updated[key] && defaults[key] !== "") updated[key] = defaults[key];
        }
        return updated;
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }, [generateNextCode]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return toast.error("Please upload a valid image file (JPG/PNG/WebP)");
    preview && URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }, [preview]);

  useEffect(() => () => { preview && URL.revokeObjectURL(preview); }, [preview]);

  const validate = useCallback(() => {
    if (!form.space) return toast.error("Select Space Type") || false;
    if (!form.space_code) return toast.error("Auto-generated space code is missing") || false;
    if (!(form.per_hour || form.per_day || form.per_month)) return toast.error("Provide at least one rate") || false;

    const numericFields = ["per_hour", "per_day", "one_week", "two_weeks", "three_weeks", "per_month", "min_duration", "max_duration"];
    const invalidField = numericFields.find(f => form[f] && !isPositiveNumber(form[f]));
    if (invalidField) return toast.error(`${FIELD_LABELS[invalidField]} must be non-negative`) || false;
    if (!image) return toast.error("Please upload a space image") || false;

    return true;
  }, [form, image]);

  // Submit using Axios and Bearer Token
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      image && fd.append("image", image);

      // ✅ Axios POST with Authorization header
      const res = await axios.post(`${API_URL}/add_space.php`, fd, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data?.success) {
        toast.success("Space added successfully!");
        await fetchExistingCodes();
        setForm(DEFAULT_FORM);
        image && URL.revokeObjectURL(preview);
        setImage(null);
        setPreview(null);
        navigate("/admin/space-master-list");
      } else {
        toast.error(res.data?.message || "Failed to add space");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Network/server error";
      toast.error(errorMsg);
    } finally { setLoading(false); }
  }, [form, image, preview, fetchExistingCodes, navigate, validate, token]);

  // Bulk generate using Axios and Bearer Token
  const bulkGenerate = useCallback(async (spaceName) => {
    if (!SPACE_GROUPS[spaceName]) return;
    if (!window.confirm(`Generate all ${spaceName} entries now?`)) return;

    setLoading(true);
    try {
      const defaults = DEFAULT_PRICES[spaceName] || {};
      const fd = new FormData();
      fd.append("group", spaceName);
      fd.append("defaults", JSON.stringify(defaults));
      if (bulkImage) fd.append("image", bulkImage);

      // ✅ Axios POST with Authorization header
      const res = await axios.post(`${API_URL}/bulk_generate_spaces.php`, fd, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = res.data;
      data?.success
        ? toast.success(`${data.created_count} spaces created, ${data.skipped_count} skipped`)
        : toast.error(data?.message || "Bulk generation failed");
      await fetchExistingCodes();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Error while bulk generating";
      toast.error(errorMsg);
    } finally { setLoading(false); }
  }, [bulkImage, fetchExistingCodes, token]);

  const groupStatus = useMemo(() => {
    const status = {};
    Object.entries(SPACE_GROUPS).forEach(([name, { prefix, max }]) => {
      const count = allCodes.filter(c => c.startsWith(prefix)).length;
      status[name] = { existing: count, max };
    });
    return status;
  }, [allCodes]);

  const GenerateButtons = useMemo(() => (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {Object.keys(SPACE_GROUPS).map((name) => {
        const { existing, max } = groupStatus[name] || { existing: 0, max: SPACE_GROUPS[name].max };
        const fullyCreated = existing >= max;
        return (
          <button
            key={name}
            type="button" // Specified type to prevent accidental form submit
            onClick={() => bulkGenerate(name)}
            disabled={loading || fullyCreated}
            className={`px-3 py-2 border rounded bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-50 ${fullyCreated ? "line-through text-gray-400" : ""}`}
            title={fullyCreated ? `${name} fully created` : `Create all ${name} entries`}
          >
            {fullyCreated ? `All ${name} created` : `Generate ${name} (${existing}/${max})`}
          </button>
        );
      })}
    </div>
  ), [bulkGenerate, groupStatus, loading]);

  const LoadingOverlay = () => loading ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-4 rounded shadow">Processing…</div>
    </div>
  ) : null;

  return (
    <div className="p-6 relative">
      <LoadingOverlay />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Add New Space</h1>
        <button onClick={() => navigate("/admin/space-master-list")} className="px-3 py-1 border border-orange-400 text-orange-500 rounded hover:bg-orange-50 transition">Space List</button>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Default Image for Bulk Generation</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setBulkImage(e.target.files?.[0] || null)}
          className="w-full border border-orange-400 rounded px-3 py-2 bg-white"
        />
      </div>

      {GenerateButtons}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Space Name <span className="text-red-500">*</span></label>
              <select name="space" value={form.space} onChange={handleInput} className="w-full border border-orange-400 rounded px-3 py-2">
                <option value="">Select Space Type</option>
                {Object.keys(SPACE_GROUPS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Space Code <span className="text-red-500">*</span></label>
              <input name="space_code" value={form.space_code} readOnly className="w-full border border-orange-400 rounded px-3 py-2 bg-gray-100" placeholder="Auto-generated" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["per_hour", "per_day", "per_month"].map(f => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">{FIELD_LABELS[f]}</label>
                  <input name={f} value={form[f]} onChange={handleInput} inputMode="numeric" className="w-full border border-orange-400 rounded px-3 py-2" />
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["one_week", "two_weeks", "three_weeks"].map(f => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">{FIELD_LABELS[f]}</label>
                  <input name={f} value={form[f]} onChange={handleInput} inputMode="numeric" className="w-full border border-orange-400 rounded px-3 py-2" />
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["min_duration", "min_duration_desc", "max_duration"].map(f => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">{FIELD_LABELS[f]}</label>
                  <input name={f} value={form[f]} onChange={handleInput} className="w-full border border-orange-400 rounded px-3 py-2" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Max Duration Description</label>
              <input name="max_duration_desc" value={form.max_duration_desc} onChange={handleInput} className="w-full border border-orange-400 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Space Image <span className="text-red-500">*</span></label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-orange-400 rounded px-3 py-2 bg-white" />
            </div>
          </div>

          <div className="space-y-6 flex flex-col items-center">
            <div className="w-full flex justify-center mt-2">
              <div className="p-2 border border-orange-300 rounded-lg bg-orange-50 shadow-sm">
                {preview ? <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded-md shadow-md" />
                  : <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">No image selected</div>}
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleInput} className="w-full border border-orange-400 rounded px-3 py-2">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="pt-4 w-full">
              <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition disabled:opacity-60">
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddSpaceMaster;