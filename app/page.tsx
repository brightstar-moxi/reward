import Navbar from "./components/public/Navbar";
import Hero from "./components/public/Hero";
import HowItWorks from "./components/public/HowItWorks";
import Rewards from "./components/public/Rewards";
import Tasks from "./components/public/Task";
import Progress from "./components/public/Progress";
import WithdrawalNotification from "./components/notifications/WithdrawalNotification";
import WithdrawalSection from "./components/public/WithdrawalSection";
import FAQ from "./components/public/FAQ";
import FinalCTA from "./components/public/Features";

import Footer from "./components/public/Footer";
import Stats from "./components/public/Stats";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Stats/>
        <HowItWorks />
        <Rewards />
        <Tasks />
        <Progress />

  {/* <WithdrawalSection /> */}
          <WithdrawalNotification/>

           <FAQ />
        <FinalCTA />
        {/* <Features />
      
        <ReferralSection />
        <FAQ /> */}
      </main>

      <Footer />
    </>
  );
}