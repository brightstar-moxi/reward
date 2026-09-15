import Navbar from "./components/public/Navbar";
import Hero from "./components/public/Hero";
import HowItWorks from "./components/public/HowItWorks";
// import Features from "@/components/public/Features";
// import Rewards from "@/components/public/Rewards";
// import ReferralSection from "@/components/public/ReferralSection";
// import FAQ from "@/components/public/FAQ";
// import Footer from "@/components/public/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        {/* <Features />
        <Rewards />
        <ReferralSection />
        <FAQ /> */}
      </main>

      {/* <Footer /> */}
    </>
  );
}