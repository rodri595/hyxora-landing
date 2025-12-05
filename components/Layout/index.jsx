import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
// import ThemeButton from "@/components/ThemeButton";
import UpButton from "@/components/UpButton";
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
      className={`flex flex-col min-h-screen ${
        isVisiblePlan ? "relative" : ""
      } ${className || ""}`}
    >
      <CustomCursor />
      {isVisiblePlan && (
        <>
          <div className="fixed left-0 top-0 right-0 z-2 h-32 pointer-events-none bg-linear-to-b from-b-surface1 from-50% to-transparent max-md:h-22 max-md:from-80%"></div>
          <div className="fixed left-0 bottom-0 right-0 z-2 h-32 pointer-events-none bg-linear-to-t from-b-surface1 from-50% to-transparent max-md:h-22 max-md:from-80%"></div>
        </>
      )}

      <Header isFixed={isFixedHeader} />
      <div className={`${classContainer || ""}`}>{children}</div>
      {!isHiddenFooter && <Footer />}
      {/* <ThemeButton className="fixed! left-5 bottom-5 z-5" /> */}
      <UpButton />
    </div>
  );
};

export default Layout;
