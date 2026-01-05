import { Routes, Route } from "react-router-dom";
import HomePage from "../Common/Pages/HomePage";
import PrivacyPolicy from "../Common/Pages/PrivacyPolicy";
import TermsAndConditions from "../Common/Pages/TermsAndConditions";
import Disclaimer from "../Common/Pages/Disclaimer";


const CommanRoutes = () => {
  return (
    <Routes>
       
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
       
    </Routes>
  );
};

export default CommanRoutes;
