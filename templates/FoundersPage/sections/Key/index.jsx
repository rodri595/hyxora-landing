"use client";
import "./style.css";
import Video from "@/components/Video";
import Icon from "@/components/Icon";
import Button from "@/components/Button";
import posterIMG from "@/assets/imgs/brand/poster.jpeg";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWeb3 } from "@/context/Web3Provider";

const Key = () => {
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
    <div id="nft-founder" className="key--container">
      <div className="key-video">
        <div className="key-video-left">
          <span className="key-video-left-a">{"// TU LLAVE DE ACCESO"}</span>
          <div className="key-video-left-b">
            La <span>llave</span> que
            <br /> abre todas las puertas
          </div>
          <div className="key-video-left-c">
            Cada Founder recibe un NFT único: es la llave digital que te da la
            propiedad del % correspondiente de Hyxora y a todas las
            funcionalidades que este status dentro de la compañía te otorga.
          </div>
        </div>
        <Video
          type="video/webm"
          src="/videos/key_card_2.webm"
          className="key-video-right"
          poster={posterIMG}
          playsInline
          autoPlay
          muted
          loop
        />
      </div>
      <div className="key-benefits">
        <div className="key-benefits-item">
          <div className="key-benefits-item-icon">
            <Icon name="lock" size="32px" />
          </div>
          <div className="key-benefits-item-content">
            <span className="key-benefits-item-content-a">Exclusividad</span>
            <span className="key-benefits-item-content-b">
              Sólo saldrán a la venta 1000 und de NFT Founder
            </span>
          </div>
        </div>
        <div className="key-benefits-item">
          <div className="key-benefits-item-icon">
            <Icon name="star" size="32px" />
          </div>
          <div className="key-benefits-item-content">
            <span className="key-benefits-item-content-a">Adjudicación</span>
            <span className="key-benefits-item-content-b">
              Serás Co-Fundador en el % de 10%/und vendidas, de Hyxora.
            </span>
          </div>
        </div>
        <div className="key-benefits-item">
          <div className="key-benefits-item-icon">
            <Icon name="refresh" size="32px" className="" />
          </div>
          <div className="key-benefits-item-content">
            <span className="key-benefits-item-content-a">
              Transmisibilidad
            </span>
            <span className="key-benefits-item-content-b">
              Podrás transferir tu NFT Founder pero todos los privilegios se
              mantendrán inalterables.
            </span>
          </div>
        </div>
      </div>
      <div className="key-extra">
        <span>1000 NFT</span>
        <span>·</span>
        <span>10% Equity</span>
        <span>·</span>
        <span>2026-2027</span>
      </div>
      <Button isPrimary onClick={handleFounderAction}>
        Quiero ser Founder de Hyxora <Icon name="arrow" className="ml-2" />
      </Button>
    </div>
  );
};

export default Key;
