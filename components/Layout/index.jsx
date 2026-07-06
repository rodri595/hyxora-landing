import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UpButton from "@/components/UpButton";
import ChatWidget from "@/components/ChatWidget";
import PurchaseNFTModal from "@/components/PurchaseNFTModal";

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
      <ChatWidget />
      <PurchaseNFTModal />
    </div>
  );
};

export default Layout;
