"use client";
import "./style.css";
import Button from "@/components/Button";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWeb3 } from "@/context/Web3Provider";

const Hero = () => {
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
    <div id="inicio" className="hero--container">
      <div className="hero-ellipsis-bg" />
      <div className="hero-ellipsis-bg2" />
      <div className="hero-content">
        <div className="hero-content-a">{"// PREVENTA EXCLUSIVA"}</div>
        <div className="hero-content-b">
          De inversor a
          <br />
          <span> Co-Fundador</span>
        </div>
        <div className="hero-content-divider" />
        <div className="hero-content-c">
          Forma parte del proyecto Hyxora de forma directa gracias a la oferta
          de <span>1000 unidades limitadas</span> de NFT Founder que formarán
          parte del <span>10% del Equity</span> de Hyxora.
        </div>
      </div>
      <div className="hero-btns">
        <Button isPrimary onClick={handleFounderAction}>
          Hazte Founder
        </Button>
      </div>
      <div className="hero-info">
        <div className="hero-info-inner">
          <div className="hero-info-item">
            <span className="hero-info-item-a">1,000</span>
            <span className="hero-info-item-b">NFTs Limitados</span>
          </div>
          <div className="hero-info-item">
            <span className="hero-info-item-a">10%</span>
            <span className="hero-info-item-b">Equity Compartido</span>
          </div>
          <div className="hero-info-item">
            <span className="hero-info-item-a">2026</span>
            <span className="hero-info-item-b">Lanzamiento previsto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
