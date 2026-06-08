"use client";
import "./style.css";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWeb3 } from "@/context/Web3Provider";

const Timeline = () => {
  const { login } = useLogin();
  const { authenticated } = usePrivy();
  const { setIsModalPurchaseNFTOpen } = useWeb3();

  const handleFounderAction = () => {
    if (authenticated) {
      setIsModalPurchaseNFTOpen(true);
    } else {
      login();
    }
  };

  return (
    <>
      <section id="roadmap" className="timeline--container">
        <div className="timeline-content">
          <div className="timeline-content-b">
            <span className="whatis-content-b-title">{"// TIMELINE"}</span>
            <span className="timeline-content-b-subtitle">
              Puede ser una inversión...
              <br />
              <span> o un legado</span>
            </span>
            <div className="whatis-content-b-div">
              <div className="whatis-content-b-div-a" />
              <div className="whatis-content-b-div-b" />
              <div className="whatis-content-b-div-c" />
            </div>
            <span className="timeline-description">
              Los NFTs Founder no son un simple activo digital. Son tu entrada al presente de sector financiero internacional, con derechos sobre un proyecto revolucionario. Aprovecha la oportunidad de ser parte activa del proyecto.
            </span>
          </div>
          <div className="timeline-content-c">
            <span className="timeline-content-c-a">Cronología de lanzamiento y precios</span>
            <span className="timeline-content-c-b">Fases de distribución del NFT Founder</span>
          </div>
          <div className="timeline-content-d">
            <div className="timeline-content-d-item">
              <div className="border-6 bg-transparent text-red-500 uppercase font-black p-2 rounded absolute -rotate-10 top-[15%] text-[40px] font-inter">
                SOLD OUT
              </div>
              <div className="timeline-content-d-item-tag">
                <span>PREVENTA - 2026</span>
              </div>
              <div className="timeline-content-d-item-a">
                <span className="timeline-content-d-item-a-a">50</span>
                <span className="timeline-content-d-item-a-b">Unidades</span>
                <div className="timeline-content-d-item-a-c" />
                <span className="timeline-content-d-item-a-d">2,000€</span>
                <span className="timeline-content-d-item-a-e">por NFT Founder</span>
              </div>
            </div>
            <div className="timeline-content-d-item">
              <div className="timeline-content-d-item-tag">
                <span>2026</span>
              </div>
              <div className="timeline-content-d-item-a">
                <span className="timeline-content-d-item-a-a">350</span>
                <span className="timeline-content-d-item-a-b">Unidades</span>
                <div className="timeline-content-d-item-a-c" />
                <span className="timeline-content-d-item-a-d">3,000€</span>
                <span className="timeline-content-d-item-a-e">por NFT Founder</span>
              </div>
            </div>
            <div className="timeline-content-d-item">
              <div className="timeline-content-d-item-tag">
                <span>2027</span>
              </div>
              <div className="timeline-content-d-item-a">
                <span className="timeline-content-d-item-a-a">600</span>
                <span className="timeline-content-d-item-a-b">Unidades</span>
                <div className="timeline-content-d-item-a-c" />
                <span className="timeline-content-d-item-a-d">6,000€</span>
                <span className="timeline-content-d-item-a-e">por NFT Founder</span>
              </div>
            </div>
          </div>
          <div className="timeline-content-e">
            <Button isSecondary onClick={handleFounderAction}>
              Asegurar mi posición
              <Icon name="arrow" className="ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Timeline;
