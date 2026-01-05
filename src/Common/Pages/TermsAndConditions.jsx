import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/homeimages/images/ICON MOX.png'
import '../../Styles/HomeStyles/HomeComman.css'

import BackToTop from "../BackToTop";

import s1 from "../../assets/homeimages/Socialmedia/s1.webp"
import s2 from "../../assets/homeimages/Socialmedia/s2.webp"
import s3 from "../../assets/homeimages/Socialmedia/s3.webp"
import s4 from "../../assets/homeimages/Socialmedia/s4.webp"




const TermsAndConditions = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const location1 = useLocation();
  useEffect(() => {
    const scrollToElement = () => {
      const { search } = location1;
      const params = new URLSearchParams(search);
      const scrollToId = params.get('');

      if (scrollToId) {
        const element = document.getElementById(scrollToId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    scrollToElement();
  }, [location1]);



  return (
    <>
      <div className='home-page  m-0   text-white'>
        {/* Navbar */}
        <header id='header' className="header">
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="EM_bot_Logo" />
            </Link>
          </div>

          <div className="nav-right">
            <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
              <ul>
                <li><Link to="/" className="active">Home</Link></li>
                <li><Link to="/?=aboutus">About us</Link></li>
                <li><Link to="/?=whychooseus">Why Choose Us</Link></li>
                <li><Link to="/?=features">Features</Link></li>
                <li><Link to="/?=howitworks">How It Works</Link></li>
                <li><Link to="/?=faq">FAQ</Link></li>
              </ul>
            </nav>

            <div className='nav-buttons '>
              <button className="buy-token-btn">
                <a style={{ textDecoration: "none", color: "#FFF" }} href="/user/signup">Connect</a>
              </button>
              <button className="buy-token-btn2">
                <a style={{ textDecoration: "none", color: "#FFF" }} href="/user/login">Sign In</a>
              </button>
            </div>
          </div>

          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="hamburger-icon"></span>
          </div>
        </header>

      

        <div
      id="terms-and-conditions"
      className="relative py-20 flex flex-col justify-center items-center gap-10 md:px-20 px-5 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url('/public/publicimagehome/faq_bg.png')`,
      }}
    >
      <div className="w-full max-w-5xl">
        <h2 className="text-gradient md:text-6xl sm:text-4xl text-3xl font-bold mb-10 text-center">
          Terms & Conditions – MOX
        </h2>

        <div className="space-y-8">
          <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
            By accessing or using MOX, you agree to comply with the following terms:
          </p>

          <div>
            <h3 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h3>
            <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
              By using MOX services, you acknowledge that you have read and understood
              these Terms & Conditions.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">2. Eligibility</h3>
            <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
              • You must be at least 18 years old to use MOX. <br />
              • By using our services, you confirm compliance with applicable laws.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">3. Use of Services</h3>
            <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
              • MOX provides automated arbitrage and crypto-related services. <br />
              • You are responsible for your actions, wallet security, and transaction approvals.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">4. Risks</h3>
            <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
              • Cryptocurrency trading involves high risks. MOX does not guarantee profits. <br />
              • Users should evaluate their risk appetite before using MOX.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">5. Limitation of Liability</h3>
            <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
              • MOX is not liable for any financial losses, technical failures, or third-party issues. <br />
              • Services are provided “as is” without warranties.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">6. Intellectual Property</h3>
            <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
              • All content, branding, and technology used by MOX are protected intellectual property. <br />
              • Unauthorized use, reproduction, or modification is prohibited.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">7. Termination</h3>
            <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
              MOX reserves the right to suspend or terminate accounts if misuse or fraud is detected.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-3">8. Updates</h3>
            <p className="font-medium md:text-[1.4rem] sm:text-lg md:leading-relaxed">
              MOX may revise these Terms at any time. Continued use of services means
              acceptance of changes.
            </p>
          </div>
        </div>
      </div>
    </div>





        {/* Footer */}

        <footer className="footer ">
          <div className='footer-top'>
            <div className='column-one'>
              <img className='f-logo align-center' src={logo} alt="logo" />
              <p className='f-para'>We’re here to help you 24/7. Whether you have a query, need technical support, or want to collaborate — reach out to us.</p>
            </div>
            <div className='column-two'>
              <h3 className='f-head'>Quick Links</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/?=aboutus">About Us</Link></li>
                <li><Link to="/?=whychooseus">Why Choose Us</Link></li>
                <li><Link to="/?=features">Features</Link></li>
                <li><Link to="/?=howitworks">How It Works</Link></li>
              </ul>
            </div>
            <div className='column-three'>
              <h3 className='f-head'>Legal</h3>
              <ul>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
                <li><Link to="/disclaimer">Disclaimer</Link></li>
              </ul>
            </div>
            <div className='column-four'>
              <h3 className='f-head'>Contact Us</h3>
              <div className='info'>
                {/* <p className='f-add align-left'>Head Office: [Insert Company Address]</p> */}
                <p className='f-add align-left'>Email: <a href="mailto:Support@mox.io" className='f-link'> support@mox.co</a></p>
                {/* <p className='f-add align-left'>Phone: <a href="tel:+1234567890" className='f-link'> +91-XXXXXXXXXX</a></p> */}
              </div>
              <div className="flex  gap-5 mt-10">
                <a href="">
                  <img src={s1} alt=" media" className='w-10' />
                </a>
                <a href="">
                  <img src={s2} alt=" media" className='w-10' />
                </a>
                <a href="">
                  <img src={s3} alt=" media" className='w-10' />
                </a>
                <a href="">
                  <img src={s4} alt=" media" className='w-10' />
                </a>
              </div>
            </div>
          </div>
          <div className='footer-bottom justify-center'>
            <p className='f-text'>© 2025 MOX Project. All Rights Reserved.</p>
          </div>
        </footer>

        {/* Back to top button */}
        <BackToTop />

      </div>
    </>
  );
};

export default TermsAndConditions;
