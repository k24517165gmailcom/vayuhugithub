import React, { useEffect, useState } from "react";
import About from "../components/About";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonails";
import Team from "../components/Team";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import WorkspacePricing from "../components/WorkspacePricing";

// IMPORT THE PROMO COMPONENT
import CoworkingPromo from "../components/CoworkingPromo";
import Amenities from "../components/Amenities";

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("visitPopup");

    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem("visitPopup", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* ---------- POPUP MODAL ----------- */}
      {showPopup && (
        <div
          className="
            fixed inset-0 bg-black/60 
            flex justify-center items-center 
            z-[9999]
          "
        >
          <div
            className="
              relative bg-white rounded-xl shadow-2xl 
              max-w-4xl w-[95%] overflow-hidden
            "
          >
            {/* Close Button */}
            <button
              className="
                absolute top-3 right-3 bg-black text-white 
                w-8 h-8 rounded-full flex items-center 
                justify-center text-lg
              "
              onClick={() => setShowPopup(false)}
            >
              ✕
            </button>

            {/* The Promo Component */}
            <CoworkingPromo />
          </div>
        </div>
      )}

      {/* ---------- PAGE CONTENT ----------- */}
      <About />
      <Amenities/>
      <WorkspacePricing />
      <Testimonials />
      {/*<Team /> */}
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
