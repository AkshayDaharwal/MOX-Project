import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/homeimages/images/ICON MOX.png'
import '../../Styles/HomeStyles/HomeComman.css'
import herobg from "../../assets/homeimages/images/herobg.mp4"
// import herobgimg from "../../assets/homeimages/images/herobgimg2.webp"

import BackToTop from "../BackToTop";

import s1 from "../../assets/homeimages/Socialmedia/s1.webp"
import s2 from "../../assets/homeimages/Socialmedia/s2.webp"
import s3 from "../../assets/homeimages/Socialmedia/s3.webp"
import s4 from "../../assets/homeimages/Socialmedia/s4.webp"

import abtimg from "../../assets/homeimages/images/about.png"

import why1 from "../../assets/homeimages/why choose/why1.png"
import why2 from "../../assets/homeimages/why choose/why2.png"
import why3 from "../../assets/homeimages/why choose/why3.png"
import why4 from "../../assets/homeimages/why choose/why4.png"
import why5 from "../../assets/homeimages/why choose/why5.png"


import feavideo from "../../assets/homeimages/Feature/feavideo.mp4";
import icon1 from "../../assets/homeimages/Feature/fea1.png";
import icon2 from "../../assets/homeimages/Feature/fea2.png";
import icon3 from "../../assets/homeimages/Feature/fea3.png";
import icon4 from "../../assets/homeimages/Feature/fea4.png";
import icon5 from "../../assets/homeimages/Feature/fea1.png";
import icon6 from "../../assets/homeimages/Feature/fea1.png";

import robot from "../../assets/homeimages/images/Steps.png";
import Model from "./splineModel/Model";

import doticon from "../../assets/homeimages/images/doticon.png"
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import robotImg from "../../assets/homeimages/images/faq.png";


const features = [
  {
    title: "Token Conversion",
    desc: "Convert USDT (BEP-20) to EM Token easily through our automated system. Secure and quick!",
    img: icon1,
  },
  {
    title: "Daily ROI Generation",
    desc: "Earn daily income starting at 0.5% ROI with locking and vesting systems that ensure stability.",
    img: icon2,
  },
  {
    title: "Smart Locking & Vesting",
    desc: "Convert to locked EM Token and receive structured income based on our vesting model during the presale phase.",
    img: icon3,
  },
  {
    title: "Affiliate Program",
    desc: "Refer others and earn additional income with our multi-level program.",
    img: icon4,
  },
  {
    title: "Secure Transactions",
    desc: "Blockchain-based, encrypted, and audited for maximum safety.",
    img: icon5,
  },
  {
    title: "Multi-Currency Support",
    desc: "Easily swap and manage multiple tokens within our platform.",
    img: icon6,
  },
];




const faqs = [
  {
    question: "What is MOX?",
    answer:
      "MOX is a decentralized automation platform that allows users to earn daily returns by converting USDT to EM Token and participating in token-based income plans with locking and vesting features.",
  },
  {
    question: "What is the minimum investment to start?",
    answer: "The minimum investment amount depends on the current platform policy.",
  },
  {
    question: "How do I earn with MOX?",
    answer:
      "You can earn by converting your USDT to EM Token and participating in various income plans.",
  },
  {
    question: "Is there any locking period for EM Token?",
    answer:
      "Yes, some plans may have a locking period based on the vesting schedule.",
  },
  {
    question: "How is the ROI calculated?",
    answer:
      "ROI is calculated based on your investment plan and the daily returns offered.",
  },
  {
    question: "Is MOX decentralized?",
    answer:
      "Yes, MOX operates in a decentralized manner ensuring transparency and security.",
  },
  {
    question: "Can I withdraw anytime?",
    answer:
      "Withdrawals depend on your plan terms; some may allow instant withdrawals, others after a lock period.",
  },
  {
    question: "What wallets are supported?",
    answer: "Popular wallets like MetaMask and Trust Wallet are supported.",
  },
  {
    question: "How do referrals work?",
    answer:
      "You can invite others using your referral link and earn rewards when they invest.",
  },
  {
    question: "Is my investment safe?",
    answer:
      "While decentralized platforms offer transparency, all investments carry some risk.",
  },
];




const steps = [
  {
    title: "Connect Wallet",
    description: "Link MetaMask, Trust Wallet, or any BEP-20 wallet securely."
  },
  {
    title: "Convert to EM Token",
    description:
      "Swap USDT (BEP-20) to EM Tokens instantly via smart contract."
  },
  {
    title: "Activate a Package",
    description:
      "Start from $100 and choose a plan with daily ROI and locking period."
  },
  {
    title: "Earn Daily Returns",
    description:
      "Receive fixed daily rewards directly in your dashboard."
  },
  {
    title: "Unlock Vesting Benefits",
    description:
      "Converted tokens are locked during presale & released gradually."
  },
  {
    title: "Withdraw or Reinvest",
    description:
      "Withdraw, reinvest, or spend globally via EM Global Card."
  },
  {
    title: "Refer & Earn More",
    description:
      "Invite others and earn through our affiliate system. Earn direct, level-based, and matching bonuses."
  }
];



const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

   const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
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
              <img src={logo} alt="MOX_Logo" />
            </Link>
          </div>

          <div className="nav-right">
            <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
              <ul>
                <li><Link to="/" className="active" onClick={handleMenuItemClick}>Home</Link></li>
                <li><Link to="/?=aboutus" onClick={handleMenuItemClick}>About us</Link></li>
                <li><Link to="/?=whychooseus" onClick={handleMenuItemClick}>Why Choose Us</Link></li>
                <li><Link to="/?=features" onClick={handleMenuItemClick}>Features</Link></li>
                <li><Link to="/?=howitworks" onClick={handleMenuItemClick}>How It Works</Link></li>
                <li><Link to="/?=faq" onClick={handleMenuItemClick}>FAQ</Link></li>
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

      

        {/* hero  */}
        <div className=" min-h-screen  relative  text-white    ">
          {/* <img src={herobgimg} alt="herobgimg" className="absolute z-[-96] md:w-[31rem] w-[16rem] md:top-10 md:right-10 right-0 bottom-28 object-cover "/> */}
          
          <p
            style={{
              WebkitTextStroke: "1px white"
            }}
            className=" absolute text-5xl font-semibold w-fit  text-transparent z-[-96]   right-0 top-28  md:rotate-90 md:block hidden "
          >
            MOX
          </p>
          <div className="  bg-[#00C16E]  absolute top-0 left-0 w-full h-full object-cover z-[-97] mix-blend-color-dodge opacity-[1] " />
          <video
            muted
            autoPlay
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-[-98] opacity-[1]    "
          >
            <source src={herobg} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="min-h-screen  px-5 md:px-20  flex flex-col   justify-evenly ">

            <div className="flex flex-col gap-5">
              <h1 className='2xl:text-[4rem] md:text-[4.2vw] sm:text-3xl text-[6vw]  2xl:leading-tight md:leading-tight sm:leading-tight  font-bold max-w-[62rem] ' >Welcome To Mox Coin – Future Of Earning Is Automated <br /> <span className="text-gradient">Join MOX</span> </h1>
              <p className=" sm:text-base text-sm ">Empowering Your Finances with Smart Crypto Automation</p>
              <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 mt-5'>
                <div className="buy-token-btn2 w-fit  flex justify-center items-center px-6">
                  <a className="text-[16px] sm:text-[14px] md:text-[20px] lg:text-[22px] xl:text-[24px]" href="/sign-up">Start Earning Now</a>
                </div>
                <div className="buy-token-btn w-fit  flex justify-center items-center px-6">
                  <a target="_Blank" className="text-[16px] sm:text-[14px] md:text-[20px] lg:text-[22px] xl:text-[24px]" href="https://drive.google.com/file/d/1c8OmEyGEMmhpWhF73-_4h3OkK2oRAjTT/view?usp=sharing">PPT</a>
                </div>
              </div>
             

            </div>

            <div className="md:absolute z-[-96] md:w-[31rem] h-[20rem] md:h-auto      border-blue-500 md:top-10 md:right-10 right-0 bottom-28 object-cover ">
              <Model
                scene="https://prod.spline.design/8ymVZKrL-2wMbFL4/scene.splinecode"
                
              />
            </div>

            <div className="flex flex-col  gap-3">
              <div className="flex  gap-5">
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
              <p>🔗 Automated ROI | Secure Staking | Smart Referrals | Powered by EM Token 🔗</p>
            </div>
          </div>

        </div>


        {/* about */}
        <div id='aboutus'
          className="relative py-20 flex flex-col lg:flex-row justify-center items-center gap-10 md:px-20 px-5 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url('/public/publicimagehome/about-bg.png')`
          }}
        >
          <div className="lg:w-1/2 flex justify-center items-center w-full">
            <div className="relative w-full max-w-[33rem] px-4 sm:px-0">
              <img src={abtimg} alt="About MOX" className="w-full h-auto" />
              <div className="bg-[#2A97FF] absolute top-0 left-0 w-full h-full mix-blend-hue opacity-100" />
            </div>
          </div>

          <div className="lg:w-1/2 w-full px-4 sm:px-0">
            <h2 className="text-gradient md:text-7xl sm:text-5xl text-4xl font-bold mb-10">About MOX</h2>
            <p className="font-medium md:text-[1.4rem] sm:text-lg max-w-[40rem] md:leading-relaxed">
              MOX is your smart gateway to the Easy Money ecosystem – helping you earn while you spend.
              Powered by the EMGT Token, it combines staking, daily rewards, cashback, and partner deals
              into one seamless platform. Whether you're investing or transacting, MOX ensures your money
              works smarter, not harder.
            </p>
          </div>
        </div>


        {/* Why Choose MOX? */}

        <div id='whychooseus'
          className="h-fit relative py-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/public/publicimagehome/why_bg.png')" }}
        >

          <div className="absolute inset-0 bg-black/60"></div>

          <div className="flex flex-col justify-center items-center h-full gap-10 relative z-10">
            <h2 className="text-gradient lg:text-7xl md:text-5xl sm:text-3xl text-3xl font-bold mb-10 text-center">
              Why Choose MOX?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-5 md:px-20">
              <div className="bg-[#000000] max-w-[509px] h-auto border border-[#00C16E36] p-5 rounded-lg shadow-lg hover:shadow-[-40px_0px_76px_0px_#00FB8E14_inset] hover:shadow-[0px_4px_4px_0px_#00C16E4A]">
                <div className="flex items-center gap-4 mb-2">
                  <img src={why1} alt="" />
                  <h3 className="font-['Open_Sans'] font-semibold text-[18px] sm:text-[20px] md:text-[22px] lg:text-[25px] text-white">
                    Verified Smart Contracts
                  </h3>
                </div>
                <p className="pl-10 font-['Montserrat'] font-normal text-[16px] sm:text-[18px] md:text-[20px] text-[#FFFFFFAB] shadow-[0px_4px_4px_#00000040]">
                  Secured earnings through blockchain-verified smart contracts for full transparency.
                </p>
              </div>

              <div className="bg-[#000000] max-w-[509px] h-auto border border-[#00C16E36] p-5 rounded-lg shadow-lg hover:shadow-[-40px_0px_76px_0px_#00FB8E14_inset] hover:shadow-[0px_4px_4px_0px_#00C16E4A]">
                <div className="flex items-center gap-4 mb-2">
                  <img src={why2} alt="" />
                  <h3 className="font-['Open_Sans'] font-semibold text-[18px] sm:text-[20px] md:text-[22px] lg:text-[25px] text-white">
                    Token Locking & Vesting for Safety
                  </h3>
                </div>
                <p className="pl-10 font-['Montserrat'] font-normal text-[16px] sm:text-[18px] md:text-[20px] text-[#FFFFFFAB] shadow-[0px_4px_4px_#00000040]">
                  Ensures fund security with structured token locking and timed vesting releases.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 justify-center md:grid-cols-2 lg:grid-cols-3 gap-10 px-5 md:px-20">
              <div className="bg-[#000000] max-w-[509px] border border-[#00C16E36] p-5 rounded-lg shadow-lg hover:shadow-[-40px_0px_76px_0px_#00FB8E14_inset] hover:shadow-[0px_4px_4px_0px_#00C16E4A]">
                <div className="flex items-center gap-4 mb-2">
                  <img src={why3} alt="" />
                  <h3 className="font-['Open_Sans'] font-semibold text-[18px] sm:text-[20px] md:text-[22px] lg:text-[25px] text-white">
                    Real-Time ROI Tracking
                  </h3>
                </div>
                <p className="pl-10 font-['Montserrat'] font-normal text-[16px] sm:text-[18px] md:text-[20px] text-[#FFFFFFAB] shadow-[0px_4px_4px_#00000040]">
                  Monitor your earnings instantly with real-time ROI tracking dashboard updates.
                </p>
              </div>

              <div className="bg-[#000000] max-w-[509px] border border-[#00C16E36] p-5 rounded-lg shadow-lg hover:shadow-[-40px_0px_76px_0px_#00FB8E14_inset] hover:shadow-[0px_4px_4px_0px_#00C16E4A]">
                <div className="flex items-center gap-4 mb-2">
                  <img src={why4} alt="" />
                  <h3 className="font-['Open_Sans'] font-semibold text-[18px] sm:text-[20px] md:text-[22px] lg:text-[25px] text-white">
                    Global Accessibility
                  </h3>
                </div>
                <p className="pl-10 font-['Montserrat'] font-normal text-[16px] sm:text-[18px] md:text-[20px] text-[#FFFFFFAB] shadow-[0px_4px_4px_#00000040]">
                  Stake your EMGT tokens securely and earn daily rewards with our robust staking platform.
                </p>
              </div>

              <div className="bg-[#000000] max-w-[509px] border border-[#00C16E36] p-5 rounded-lg shadow-lg hover:shadow-[-40px_0px_76px_0px_#00FB8E14_inset] hover:shadow-[0px_4px_4px_0px_#00C16E4A]">
                <div className="flex items-center gap-4 mb-2">
                  <img src={why5} alt="" />
                  <h3 className="font-['Open_Sans'] font-semibold text-[18px] sm:text-[20px] md:text-[22px] lg:text-[25px] text-white">
                    24/7 Customer Support
                  </h3>
                </div>
                <p className="pl-10 font-['Montserrat'] font-normal text-[16px] sm:text-[18px] md:text-[20px] text-[#FFFFFFAB] shadow-[0px_4px_4px_#00000040]">
                  Round-the-clock expert assistance to support you anytime, anywhere, always.
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Core Features Section */}

        <section id="features" className="text-white py-24 px-6 md:px-20">
          <h2 className="text-gradientt lg:text-7xl md:text-5xl sm:text-3xl text-3xl font-bold mb-10 text-center  
          ">
            Core Features of MOX
          </h2>

          <div className="bg-[#000000] shadow-[0px_0px_84px_0px_#2A97FF40_inset] flex flex-col lg:flex-row gap-6 py-12 px-4 items-center">


            <div className="flex justify-center lg:w-[45%] w-full">
              <div className="w-full max-w-[600px] rounded-lg overflow-hidden bg-black">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover"
                >
                  <source src={feavideo} type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="bg-[#000000] lg:w-[55%] w-full max-h-[550px] overflow-y-auto custom-scrollbar pr-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 shadow-md mb-4"
                >
                  <img
                    src={feature.img}
                    alt={feature.title}
                    className="w-[38px] h-[38px] object-contain flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-['Open_Sans'] font-semibold text-[18px] sm:text-[20px] md:text-[22px] lg:text-[25px] text-white">
                      {feature.title}
                    </h3>
                    <p className="font-['Montserrat'] font-normal text-[16px] sm:text-[18px] md:text-[20px] text-[#FFFFFFAB] shadow-[0px_4px_4px_0px_#00000040]">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* How It Works steps Section */}

        <section id="howitworks"
          className="bg-black bg-cover bg-center bg-no-repeat text-white py-20 px-6 md:px-20"
          style={{ backgroundImage: "url('/public/publicimagehome/step-bg.png')" }}
        >
          <h2 className="text-gradient text-left lg:text-6xl md:text-5xl sm:text-3xl text-3xl font-bold mb-6 max-w-[1004px] tracking-[10%] leading-[130%]">
            Simple Steps to Start Earning with MOX
          </h2>

          <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            <div className="space-y-6 flex flex-col items-start">
              <p className="font-montserrat font-medium text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] text-white">
                MOX is designed to be beginner-friendly, yet powerful enough for experienced crypto users. Here's how it works:
              </p>
              <button className="bg-[#209AD5D9] hover:bg-blue-600 transition px-6 py-2 rounded-[121px] text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] font-semibold text-white shadow-[inset_0px_0px_28.6px_0px_#000000E5]">
                Start Earning Now
              </button>
              <img
                src={robot}
                alt="Robot"
                className="w-full max-w-[480px] h-auto mx-auto lg:mx-0"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 h-full border-l-2 border-dashed border-white/60 hidden sm:block"></div>

              <div className="space-y-10">
                {steps.map((step, index) => (
                  <div key={index} className="relative pl-12">
                    <div className="absolute left-[-15px] top-1 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                      <img
                        src={doticon}
                        alt="step icon"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="font-open-sans font-semibold text-[18px] sm:text-[20px] md:text-[22px] leading-[100%] tracking-[10%] text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="font-montserrat font-normal text-[16px] sm:text-[18px] md:text-[20px] leading-[130%] text-[#FFFFFFAB] shadow-[0px_4px_4px_0px_#00000040]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* FAQ Section */}

        <div id='faq' className="bg-[#151515] bg-[url('/public/publicimagehome/faq_bg.png')] bg-cover bg-center text-white py-28 px-5 md:px-36">
          <h2 className="text-gradient text-center lg:text-6xl md:text-5xl sm:text-3xl text-3xl font-bold mb-10 ">
            Frequently Asked Questions (FAQ)
          </h2>

          <div className="max-w-8xl mx-auto flex flex-col md:flex-col lg:flex-row gap-10 items-start">
            <div className="w-full lg:w-8/12">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="pb-4 cursor-pointer"
                    style={{
                      borderBottom: "1px solid",
                      borderImageSource:
                        "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(238,238,238,0.3) 46.15%, rgba(0,0,0,0.3) 100%)",
                      borderImageSlice: 1
                    }}
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-['Open_Sans'] font-semibold text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] text-white">
                        {faq.question}
                      </h3>
                      <span className="text-xl">
                        {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </div>
                    {openIndex === index && (
                      <p className="mt-3 font-['Montserrat'] font-normal text-[16px] sm:text-[18px] md:text-[20px] text-[#FFFFFFAB] shadow-[0px_4px_4px_#00000040] leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-4/12 flex justify-center items-center h-screen">
              <img src={robotImg} alt="Robot" className="w-full h-auto max-w-sm" />
            </div>


            {/* <div className="w-full lg:w-4/12 flex justify-center items-center">
              <img src={robotImg} alt="Robot" className="w-full h-auto" />
            </div> */}
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
            <p className='f-text'>© 2025 mox Project. All Rights Reserved.</p>
          </div>
        </footer>

        {/* Back to top button */}
        <BackToTop />

      </div>
    </>
  );
};

export default HomePage;
