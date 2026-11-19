import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import FreeTrialButton from "@/components/FreeTrialButton";
import Header from "@/components/Header";
import PurchaseNFTModal from "@/components/PurchaseNFTModal";
import UpButton from "@/components/UpButton";
import WhatsAppButton from "@/components/WhatsAppButton";

const Layout = ({
  className,
  classContainer,
  isFixedHeader,
  isVisiblePlan,
  isHiddenFooter,
  children,
}) => {
  return (
    <div
      className={`flex flex-col min-h-screen bg-b-surface1 ${
        isVisiblePlan ? "relative" : ""
      } ${className || ""}`}
    >
      <Header isFixed={isFixedHeader} />
      <div className={`${classContainer || ""}`}>{children}</div>
      {!isHiddenFooter && <Footer />}
      <UpButton />
      <WhatsAppButton />
      <ChatWidget />
      <FreeTrialButton />
      <PurchaseNFTModal />
    </div>
  );
};

export default Layout;
