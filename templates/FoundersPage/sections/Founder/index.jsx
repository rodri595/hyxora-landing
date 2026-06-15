import Icon from "@/components/Icon";
import "./style.css";

const Founder = () => {
  return (
    <section id="beneficios" className="founder--container">
      <div className="founder--content">
        <span className="founder--content-a">{"// BENEFICIOS FOUNDER"}</span>
        <div className="founder--content-b">
          Por qué ser <strong>Founder</strong>
        </div>
        <div className="founder-div">
          <div className="founder-div-a" />
          <div className="founder-div-b" />
          <div className="founder-div-c" />
        </div>
        <span className="founder--content-c">
          Beneficios exclusivos que te diferencian como pionero del proyecto
        </span>
      </div>
      <div className="founder-list">
        <div className="founder-list-item">
          <div className="founder-list-item-box">
            <span>01</span>
          </div>
          <div className="founder-list-item-content">
            <div className="founder-list-item-content-top">
              <Icon name="star" size="24px" />
              <span className="founder-list-item-content-title">
                Propiedad Real
              </span>
            </div>
            <span className="founder-list-item-content-bottom">
              Registrada en Blockchain; acceso directo a la app y
              funcionalidades especiales.
            </span>
          </div>
        </div>
        <div className="founder-list-item">
          <div className="founder-list-item-box">
            <span>02</span>
          </div>
          <div className="founder-list-item-content">
            <div className="founder-list-item-content-top">
              <Icon name="star" size="24px" />
              <span className="founder-list-item-content-title">
                Privilegios Vitalicios
              </span>
            </div>
            <span className="founder-list-item-content-bottom">
              Suscripción Founder gratuita de por vida y acceso prioritario.
            </span>
          </div>
        </div>
        <div className="founder-list-item">
          <div className="founder-list-item-box">
            <span>03</span>
          </div>
          <div className="founder-list-item-content">
            <div className="founder-list-item-content-top">
              <Icon name="star" size="24px" />
              <span className="founder-list-item-content-title">
                Comité consultivo
              </span>
            </div>
            <span className="founder-list-item-content-bottom">
              Participación en decisiones consultivas como Fundador.
            </span>
          </div>
        </div>
        <div className="founder-list-item">
          <div className="founder-list-item-box">
            <span>04</span>
          </div>
          <div className="founder-list-item-content">
            <div className="founder-list-item-content-top">
              <Icon name="star" size="24px" />
              <span className="founder-list-item-content-title">
                Transmisible
              </span>
            </div>
            <span className="founder-list-item-content-bottom">
              Se puede vender o heredar; el nuevo propietario mantendrá los
              privilegios.
            </span>
          </div>
        </div>
        <div className="founder-list-item">
          <div className="founder-list-item-box">
            <span>05</span>
          </div>
          <div className="founder-list-item-content">
            <div className="founder-list-item-content-top">
              <Icon name="star" size="24px" />
              <span className="founder-list-item-content-title">
                Diferenciación
              </span>
            </div>
            <span className="founder-list-item-content-bottom">
              Reconocimiento especial en app y eventos.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Founder;
