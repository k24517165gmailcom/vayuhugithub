import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios"; // ✅ Added Axios
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import VirtualOfficeBookingModal from "./VirtualOfficeBookingModal";

const VirtualOfficeForm = () => {
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

  const nameInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Retrieve Bearer Token
  const token = localStorage.getItem("token");

  // ----------------------------------
  // Submit Form
  // ----------------------------------
  const onSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const payload = {
      name: form.Name.value,
      email: form.Email.value,
      phone: form.Contact.value,
      referral: form.Referral.value,
      message: form.Message.value,
    };

    setLoading(true);

    try {
      // ✅ Using Axios with Authorization Header
      const response = await axios.post(
        `${API_BASE}/add_virtual_office_enquiry.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = response.data; // Axios automatically parses JSON

      if (data.status === "success") {
        toast.success(data.message || "Enquiry submitted successfully");
        form.reset();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Enquiry submit error:", error);
      const errorMsg = error.response?.data?.message || "Network error. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // Focus on Enquiry
  // ----------------------------------
  const handleEnquiryClick = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <motion.section
      id="VirtualOfficeForm"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-20 px-6 lg:px-32 bg-white text-center"
    >
      {/* Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow"
        >
          Book Now
        </button>

        <button
          onClick={handleEnquiryClick}
          className="flex items-center gap-2 border border-orange-400 text-orange-600 px-6 py-2 rounded-xl hover:bg-orange-50"
        >
          » Enquiry Now
        </button>
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-semibold mb-10">
        Get Started with Your{" "}
        <span className="text-orange-500">Virtual Office</span>
      </h2>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg border"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="relative">
            <input
              ref={nameInputRef}
              name="Name"
              placeholder="Your Name"
              required
              className="w-full border rounded-lg py-3 px-4"
            />
            <User className="absolute right-3 top-3.5 text-orange-500" />
          </div>

          {/* Email */}
          <div className="relative">
            <input
              name="Email"
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-lg py-3 px-4"
            />
            <Mail className="absolute right-3 top-3.5 text-orange-500" />
          </div>

          {/* Phone */}
          <div className="relative">
            <input
              name="Contact"
              placeholder="Contact Number"
              required
              className="w-full border rounded-lg py-3 px-4"
            />
            <Phone className="absolute right-3 top-3.5 text-orange-500" />
          </div>

          {/* Referral */}
          <select
            name="Referral"
            className="w-full border rounded-lg py-3 px-4"
          >
            <option value="">Referral Source</option>
            <option>Google Search</option>
            <option>Friend / Colleague</option>
            <option>Social Media</option>
            <option>Other</option>
          </select>
        </div>

        {/* Message */}
        <div className="relative mt-6">
          <textarea
            name="Message"
            rows="4"
            placeholder="Your Message..."
            required
            className="w-full border rounded-lg py-3 px-4"
          />
          <MessageSquare className="absolute right-3 top-3.5 text-orange-500" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-orange-500 text-white py-3 rounded-lg"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Modal */}
      <VirtualOfficeBookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </motion.section>
  );
};

export default VirtualOfficeForm;