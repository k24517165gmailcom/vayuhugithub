import React from "react";
import { X, Printer, Calendar, User, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VirtualOfficeDetailsModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Booking Details</h3>
              <p className="text-sm text-gray-500">ID: #{booking.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            
            {/* Status Section */}
            <div className="flex justify-between items-center bg-orange-50 p-4 rounded-lg border border-orange-100">
               <div>
                  <p className="text-sm text-gray-500 mb-1">Current Status</p>
                  <span className={`text-sm font-bold uppercase flex items-center gap-2 ${booking.status === 'Active' ? 'text-green-700' : 'text-red-600'}`}>
                    {booking.status === 'Active' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                    {booking.status}
                  </span>
               </div>
               <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  <span className={`font-mono font-bold ${booking.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                    {booking.payment_status}
                  </span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Details */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-gray-700 border-b pb-2">
                    <User size={18} /> Customer Info
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                   <p><span className="font-medium text-gray-900">Name:</span> {booking.user_name}</p>
                   <p><span className="font-medium text-gray-900">Email:</span> {booking.user_email}</p>
                   <p><span className="font-medium text-gray-900">User ID:</span> {booking.user_id}</p>
                </div>
              </div>

              {/* Booking Dates */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-gray-700 border-b pb-2">
                    <Calendar size={18} /> Subscription Period
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                   <p><span className="font-medium text-gray-900">Start Date:</span> {booking.start_date}</p>
                   <p><span className="font-medium text-gray-900">End Date:</span> {booking.end_date}</p>
                   <p><span className="font-medium text-gray-900">Duration:</span> 1 Year</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 md:col-span-2">
                <h4 className="flex items-center gap-2 font-semibold text-gray-700 border-b pb-2">
                    <CreditCard size={18} /> Payment Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                   <div>
                       <p className="text-gray-500 text-xs">Transaction ID</p>
                       <p className="font-mono font-medium text-gray-800 break-all">{booking.payment_id || "N/A"}</p>
                   </div>
                   <div>
                       <p className="text-gray-500 text-xs">Total Amount</p>
                       <p className="font-bold text-gray-800 text-lg">₹{Number(booking.total_amount).toLocaleString()}</p>
                   </div>
                   <div>
                       <p className="text-gray-500 text-xs">Booking Date</p>
                       <p className="text-gray-800">{new Date(booking.created_at).toLocaleString()}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
            <button 
                onClick={onClose} 
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
                Close
            </button>
            <button 
                onClick={() => window.print()} 
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition flex items-center gap-2"
            >
                <Printer size={16} /> Print Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VirtualOfficeDetailsModal;