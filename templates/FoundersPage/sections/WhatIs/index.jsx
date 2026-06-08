import "./style.css";
import Icon from "@/components/Icon";

const WhatIs = () => {
  return (
    <section id="que-es" className="whatis--container">
      <div className="whatis-ellipse-bg" />
      <div className="whatis-content">
        <div className="whatis-content-b">
          <span className="whatis-content-b-title">{"// ACERCA DE"}</span>
          <span className="whatis-content-b-subtitle">¿Qué es Hyxora?</span>
          <div className="whatis-content-b-div">
            <div className="whatis-content-b-div-a" />
            <div className="whatis-content-b-div-b" />
            <div className="whatis-content-b-div-c" />
          </div>
          <span className="whatis-content-b-description">
            El puente entre la banca tradicional y las finanzas del presente. En
            tus manos, desde hoy mismo.
          </span>
          <span className="whatis-content-b-extra">
            Un proyecto que reúne lo mejor de los dos mundos sin fricciones, sin
            complicaciones, con total transparencia y seguridad.
          </span>
        </div>
        <div className="whatis-content-c">
          <div className="whatis-content-c-a">
            <p>
              La decisión es tuya de cuando quieres unirte, pero la oportunidad
              es limitada y única, no lo olvides
            </p>
          </div>
        </div>
        <div className="whatis-content-d">
          <div className="whatis-content-d-item">
            <div className="whatis-content-d-item-inner">
              <div className="whatis-content-d-item-inner-box-icon">
                <Icon
                  name="shield"
                  className="whatis-content-d-item-inner-icon"
                  size={20}
                />
              </div>
              <div className="whatis-content-d-item-inner-text">
                <span className="whatis-content-d-item-inner-text-a">
                  IBAN Europeo
                </span>
                <span className="whatis-content-d-item-inner-text-b">
                  Seguridad y transparencia
                </span>
              </div>
            </div>
          </div>
          <div className="whatis-content-d-item">
            <div className="whatis-content-d-item-inner">
              <div className="whatis-content-d-item-inner-box-icon">
                <Icon
                  name="check"
                  className="whatis-content-d-item-inner-icon"
                />
              </div>
              <div className="whatis-content-d-item-inner-text">
                <span className="whatis-content-d-item-inner-text-a">
                  Wallet autocustodia
                </span>
                <span className="whatis-content-d-item-inner-text-b">
                  Tu dinero, en tus manos.
                </span>
              </div>
            </div>
          </div>
          <div className="whatis-content-d-item">
            <div className="whatis-content-d-item-inner">
              <div className="whatis-content-d-item-inner-box-icon">
                <Icon
                  name="flash"
                  className="whatis-content-d-item-inner-icon"
                  size={20}
                />
              </div>
              <div className="whatis-content-d-item-inner-text">
                <span className="whatis-content-d-item-inner-text-a">SEPA</span>
                <span className="whatis-content-d-item-inner-text-b">
                  Transferencias y depósitos
                </span>
              </div>
            </div>
          </div>
          <div className="whatis-content-d-item">
            <div className="whatis-content-d-item-inner">
              <div className="whatis-content-d-item-inner-box-icon">
                <Icon
                  name="cube"
                  className="whatis-content-d-item-inner-icon"
                />
              </div>
              <div className="whatis-content-d-item-inner-text">
                <span className="whatis-content-d-item-inner-text-a">
                  Todo en el mismo lugar
                </span>
                <span className="whatis-content-d-item-inner-text-b">
                  Depósitos, swap Fiat-Cripto Cripto-Fiat, remesas
                  internacionales
                </span>
              </div>
            </div>
          </div>
          <div className="whatis-content-d-item">
            <div className="whatis-content-d-item-inner">
              <div className="whatis-content-d-item-inner-box-icon">
                <Icon
                  name="star"
                  className="whatis-content-d-item-inner-icon"
                />
              </div>
              <div className="whatis-content-d-item-inner-text">
                <span className="whatis-content-d-item-inner-text-a">
                  Soluciones Defi
                </span>
                <span className="whatis-content-d-item-inner-text-b">
                  Staking, Fondos indexados, ingresos pasivos
                </span>
              </div>
            </div>
          </div>
          <div className="whatis-content-d-item">
            <div className="whatis-content-d-item-inner">
              <div className="whatis-content-d-item-inner-box-icon">
                <Icon
                  name="wallet"
                  className="whatis-content-d-item-inner-icon"
                  size={20}
                />
              </div>
              <div className="whatis-content-d-item-inner-text">
                <span className="whatis-content-d-item-inner-text-a">
                  Tarjetas de uso internacional
                </span>
                <span className="whatis-content-d-item-inner-text-b">
                  Paga en Fiat o Cripto.
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="whatis-content-e">
          <div className="whatis-content-e-inner">
            <p>
              La decisión es tuya de cuando quieres unirte, pero la oportunidad
              es limitada y única, no lo olvides
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIs;
