"use client";

import Layout from "@/components/Layout";
import FeesTable from "@/templates/HomePage/Plans/FeesTable";
import SectionRail from "./SectionRail";

const TermsPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col gap-[130px] maxmd:gap-[80px] py-[100px]"
    >
      <section className="flex flex-col gap-8 max-w-[1370px] mx-auto w-full py-10 px-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">
            Términos y Condiciones de Uso de la Plataforma HYXORA
          </h1>
          <p className="text-sm text-gray-400">
            Fecha de entrada en vigor: 4 de mayo de 2026
          </p>
        </div>

        <div
          data-rail="Aviso Legal"
          data-rail-accent="true"
          className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm leading-relaxed"
        >
          <p>
            HYXORA es una interfaz de software de autocustodia. HYXORA no es un
            banco, ni una entidad de dinero electrónico, ni una entidad de pago,
            ni una empresa de servicios de inversión, ni una institución de
            inversión colectiva, ni un custodio de activos. HYXORA no recibe
            depósitos, no ofrece «depósitos remunerados», «cuentas remuneradas»
            ni «fondos», no garantiza rendimientos y no presta asesoramiento
            financiero, de inversión, jurídico ni fiscal.
          </p>
          <p>
            Los activos digitales son altamente volátiles y su valor puede
            llegar a ser cero. La interacción con protocolos de finanzas
            descentralizadas (DeFi) de terceros conlleva riesgo de pérdida total
            e irreversible. Usted opera bajo su entera y exclusiva
            responsabilidad. No existe fondo de garantía de depósitos ni esquema
            de indemnización de inversores aplicable a su actividad en la
            Plataforma.
          </p>
          <p>
            Al crear una cuenta o utilizar la Plataforma, usted declara haber
            leído, comprendido y aceptado íntegramente estos Términos.
          </p>
        </div>

        <div className="flex flex-col gap-6 text-base leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:leading-relaxed [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2">
          {/* 1. Identificación y aceptación */}
          <div
            data-rail="Operador y Aceptación"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              1. Identificación del operador y aceptación
            </h2>
            <h3>1.1 Operador</h3>
            <p>
              La plataforma accesible a través de hyxora.com, sus subdominios,
              aplicaciones móviles e interfaces asociadas (la «Plataforma») es
              operada por HYXORA FINANCE, S.A., constituida y existente conforme
              a las leyes de la República de Panamá, RUC 155783897-2-2026, con
              domicilio en Provincia de Panamá, distrito de Panamá, Betania, Vía
              Ricardo J. Alfaro, PH The Century Tower, oficina 317 (en adelante,
              «HYXORA», «nosotros» o «la Sociedad»).
            </p>
            <h3>1.2 Aceptación</h3>
            <p>
              Estos Términos y Condiciones (los «Términos») constituyen un
              contrato vinculante entre HYXORA y la persona física o jurídica
              que accede, se registra o utiliza la Plataforma (el «Usuario» o
              «usted»). El acceso, registro o uso de la Plataforma implica la
              aceptación plena y sin reservas de los Términos. Si usted no está
              de acuerdo con cualquiera de sus disposiciones, debe abstenerse de
              utilizar la Plataforma.
            </p>
            <h3>1.3 Documentos integrantes</h3>
            <p>
              Forman parte inseparable de estos Términos la Política de
              Privacidad (https://hyxora.com/privacy), la política de comisiones
              y planes vigente, y cualesquiera condiciones específicas que
              HYXORA publique para servicios o funcionalidades concretas. En
              caso de contradicción entre estos Términos y unas condiciones
              específicas, prevalecerán estas últimas respecto del servicio que
              regulen.
            </p>
            <h3>1.4 Fase MVP</h3>
            <p>
              La Plataforma se encuentra en fase inicial de producto mínimo
              viable («MVP»). Determinadas funcionalidades pueden estar
              limitadas, en pruebas, sujetas a disponibilidad por país, o no
              encontrarse aún operativas. HYXORA podrá añadir, modificar,
              limitar o retirar funcionalidades en cualquier momento conforme a
              la cláusula 21.
            </p>
          </div>

          {/* 2. Definiciones */}
          <div
            data-rail="Definiciones"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">2. Definiciones</h2>
            <p>
              A los efectos de estos Términos, los siguientes términos tendrán
              el significado que se indica:
            </p>
            <ul>
              <li>
                «Activos Digitales» o «Criptoactivos»: representaciones
                digitales de valor o derechos susceptibles de transferirse y
                almacenarse electrónicamente mediante tecnología de registro
                distribuido, incluyendo stablecoins (p. ej. USD/EUR tokenizados)
                y otros criptoactivos.
              </li>
              <li>
                «Wallet Autocustodiada»: monedero no custodiado del Usuario,
                instrumentado como Cuenta Inteligente y operado a través de la
                infraestructura del Proveedor de Wallet, cuyas claves o factores
                de control corresponden exclusivamente al Usuario y a los que
                HYXORA no tiene acceso ni control.
              </li>
              <li>
                «Proveedor de Wallet»: el proveedor tecnológico tercero e
                independiente de infraestructura de monederos integrados
                (actualmente Privy o el proveedor que HYXORA designe), que
                presta sus servicios bajo sus propios términos.
              </li>
              <li>
                «Cuenta Inteligente» o «Smart Wallet»: el monedero del Usuario
                implementado mediante un contrato inteligente de cuenta estándar
                y auditado de un tercero, del que el Usuario es único titular y
                firmante, sin que HYXORA ostente llave, copropiedad, módulo,
                guardián, clave de recuperación ni facultad de disposición
                alguna sobre él.
              </li>
              <li>
                «Patrocinio de Comisiones de Red» o «Paymaster»: mecanismo
                técnico de abstracción de cuenta (actualmente a través de
                Pimlico, u otro proveedor que HYXORA designe) por el que HYXORA
                puede asumir el costo de las comisiones de red (gas) de
                operaciones iniciadas y firmadas por el Usuario, sin que ello
                confiera a HYXORA control alguno sobre la Cuenta Inteligente.
              </li>
              <li>
                «Proveedores de Rampa»: terceros independientes, debidamente
                autorizados en sus respectivas jurisdicciones, que prestan
                servicios de conversión entre dinero fiat y Criptoactivos
                (on-ramp / off-ramp) y, en su caso, servicios de pago o de
                cuenta asociados.
              </li>
              <li>
                «Protocolo(s) DeFi»: los protocolos, contratos inteligentes y
                curadores de finanzas descentralizadas de terceros,
                independientes de HYXORA, a los que el Usuario puede acceder a
                través de la Plataforma. La funcionalidad de acceso del Usuario
                a dichos protocolos se denomina en la interfaz «Protocolos DeFi»
                y no constituye fondo, vehículo de inversión colectiva, producto
                estructurado, ETF ni depósito.
              </li>
              <li>
                «Swap»: funcionalidad que permite al Usuario instruir el
                intercambio entre Activos Digitales y/o entre fiat y Activos
                Digitales, ejecutado a través de proveedores de liquidez,
                agregadores o mercados de terceros.
              </li>
              <li>
                «Contenido de la Plataforma»: todo software, código, interfaces,
                marcas, textos, diseños y demás elementos de HYXORA.
              </li>
              <li>
                «Persona Restringida»: cualquier persona comprendida en la
                cláusula 5.2.
              </li>
            </ul>
          </div>

          {/* 3. Objeto y naturaleza jurídica */}
          <div
            data-rail="Objeto y Naturaleza"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              3. Objeto y naturaleza jurídica del servicio
            </h2>
            <h3>3.1 Objeto</h3>
            <p>
              HYXORA pone a disposición del Usuario una interfaz tecnológica de
              software que le permite, mediante una Wallet Autocustodiada de su
              exclusiva titularidad y control: (a) crear y gestionar dicho
              monedero; (b) acceder a servicios de conversión fiat–cripto
              prestados por Proveedores de Rampa; (c) instruir operaciones de
              Swap ejecutadas por terceros; y (d) acceder e interactuar de forma
              directa con Protocolos DeFi de terceros.
            </p>
            <h3>3.2 Naturaleza de prestador de software</h3>
            <p>
              HYXORA actúa exclusivamente como proveedor de una capa de software
              que facilita técnicamente el acceso del Usuario a redes blockchain
              y a servicios de terceros. HYXORA no actúa como contraparte,
              principal, intermediario financiero, agente, fiduciario ni gestor
              por cuenta del Usuario en ninguna de dichas operaciones. Las
              operaciones se ejecutan entre el Usuario y los terceros
              correspondientes y/o directamente en cadena (on-chain).
            </p>
            <h3>3.3 Inexistencia de relación de depósito o custodia</h3>
            <p>
              HYXORA en ningún momento recibe, mantiene, controla, posee ni
              dispone de los fondos fiat o de los Criptoactivos del Usuario, ni
              de sus claves privadas o factores de control. No existe entre
              HYXORA y el Usuario relación alguna de depósito, cuenta de pago,
              custodia, administración de activos ni gestión discrecional.
            </p>
          </div>

          {/* 4. Lo que HYXORA NO es */}
          <div
            data-rail="Qué NO es HYXORA"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              4. Lo que HYXORA NO es y NO hace
            </h2>
            <p>El Usuario reconoce y acepta expresamente que HYXORA:</p>
            <ul>
              <li>
                no es un banco ni una entidad de crédito, y no capta depósitos
                ni fondos reembolsables del público;
              </li>
              <li>
                no es una entidad de dinero electrónico ni una entidad de pago,
                y no presta servicios de pago ni emite dinero electrónico;
              </li>
              <li>
                no es una empresa de servicios de inversión, gestora de activos
                ni asesor; no gestiona carteras ni recibe o transmite órdenes
                por cuenta del Usuario;
              </li>
              <li>
                no constituye, comercializa ni administra fondos, fondos de
                inversión, instituciones de inversión colectiva, ETF, productos
                estructurados, «depósitos», «depósitos remunerados», «cuentas
                remuneradas», productos de ahorro ni productos de inversión; no
                emite participaciones, unidades ni valores;
              </li>
              <li>
                no es un proveedor de servicios de custodia de criptoactivos ni
                de salvaguarda de claves;
              </li>
              <li>
                no es una plataforma de negociación, exchange ni creador de
                mercado que actúe como contraparte de las operaciones;
              </li>
              <li>
                no garantiza ni promete rendimiento, rentabilidad, preservación
                de capital ni resultado alguno;
              </li>
              <li>
                no presta asesoramiento de inversión, financiero, contable,
                jurídico ni fiscal de ninguna clase.
              </li>
            </ul>
            <p>
              Cualquier denominación comercial, material de marketing o
              expresión coloquial que pudiera sugerir lo contrario (incluidos
              términos como «neobanco», «cuenta», «depósito», «fondo» o
              similares) tiene carácter meramente divulgativo y no altera la
              naturaleza jurídica descrita en estos Términos, que prevalece a
              todos los efectos.
            </p>
            <p>
              La funcionalidad de acceso a estrategias de rendimiento se
              denomina única y exclusivamente «Protocolos DeFi» y consiste en el
              acceso no custodiado del Usuario a protocolos de finanzas
              descentralizadas de terceros. Queda expresamente excluida, tanto
              en la interfaz como en cualquier comunicación o material, su
              designación como «depósito», «depósito remunerado», «cuenta
              remunerada», «ahorro», «fondo», «fondo de inversión», «ETF»,
              «producto de inversión», «staking» o «earn», o cualquier término
              que sugiera captación de fondos, gestión colectiva, asesoramiento
              o garantía por parte de HYXORA.
            </p>
            <p>
              Ningún rendimiento podrá presentarse, denominarse ni atribuirse
              como pagado, remunerado, gestionado o garantizado por HYXORA. Todo
              rendimiento procede exclusivamente de los Protocolos DeFi de
              terceros, es variable y no está garantizado. En la medida en que
              la interfaz utilice términos abreviados por motivos de usabilidad,
              prevalecerá a todos los efectos la naturaleza jurídica y la
              denominación establecidas en esta cláusula y en la cláusula 10.
            </p>
          </div>

          {/* 5. Elegibilidad y personas restringidas */}
          <div
            data-rail="Elegibilidad"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              5. Elegibilidad y personas restringidas
            </h2>
            <h3>5.1 Requisitos</h3>
            <p>
              Para utilizar la Plataforma el Usuario debe: (a) ser mayor de 18
              años y tener plena capacidad de obrar; (b) actuar en nombre propio
              o, si es persona jurídica, contar con poder suficiente; (c) no ser
              una Persona Restringida; y (d) cumplir las leyes que le sean
              aplicables, incluidas las de naturaleza fiscal, cambiaria y de
              prevención de blanqueo.
            </p>
            <h3>5.2 Personas Restringidas</h3>
            <p>
              No puede registrarse ni utilizar la Plataforma, directa o
              indirectamente, ninguna persona que:
            </p>
            <ul>
              <li>
                (a) sea ciudadano, residente, o se encuentre físicamente, o esté
                constituida o domiciliada, en los Estados Unidos de América, o
                sea una «U.S. person»;
              </li>
              <li>
                (b) sea nacional o residente de, o se encuentre en, cualquier
                jurisdicción sujeta a sanciones financieras integrales de la
                ONU, la Unión Europea, los Estados Unidos (OFAC), el Reino Unido
                o cualquier autoridad competente aplicable;
              </li>
              <li>
                (c) figure, o esté participada o controlada por personas que
                figuren, en listas de sanciones (incluidas las listas SDN de
                OFAC, las listas consolidadas de la UE/ONU/Reino Unido) o sea
                objeto de medidas restrictivas;
              </li>
              <li>
                (d) se encuentre en una jurisdicción identificada por el
                GAFI/FATF como sujeta a llamamiento a la acción («call for
                action»);
              </li>
              <li>
                (e) pretenda utilizar la Plataforma para una actividad que sería
                ilícita conforme al Derecho que le resulte aplicable, o para
                cuya prestación HYXORA o un tercero necesitaría una autorización
                de la que carece en la jurisdicción del Usuario.
              </li>
            </ul>
            <h3>5.3 Declaraciones del Usuario</h3>
            <p>
              El Usuario declara y garantiza, en el momento del registro y de
              forma continuada mientras utilice la Plataforma, que no es una
              Persona Restringida, que la información que facilita es veraz y
              completa, que los fondos y Criptoactivos que emplea son de origen
              lícito y de su titularidad, y que su uso de la Plataforma no
              infringe ninguna ley que le sea aplicable. La condición de Persona
              Restringida sobrevenida obliga al Usuario a cesar de inmediato en
              el uso de la Plataforma y a notificarlo a HYXORA.
            </p>
            <h3>5.4 Prohibición de elusión</h3>
            <p>
              Queda prohibido el uso de VPN, suplantación de localización,
              intermediarios, testaferros o cualquier medio dirigido a eludir
              las restricciones de esta cláusula. Su incumplimiento faculta a
              HYXORA a aplicar la cláusula 18.
            </p>
            <h3>5.5 Ámbito territorial e iniciativa del Usuario</h3>
            <p>
              La Plataforma no se dirige ni se ofrece a personas situadas o
              residentes en jurisdicciones en las que el acceso a la Plataforma,
              o a los servicios de terceros accesibles a través de ella,
              requeriría una autorización, registro o licencia de la que HYXORA
              o dichos terceros carezcan, o resultaría contrario a la normativa
              aplicable. El Usuario accede a la Plataforma por su propia y
              exclusiva iniciativa, valorando si ello es conforme con la
              normativa que le resulte aplicable, y asume la responsabilidad de
              dicho cumplimiento. HYXORA podrá restringir o condicionar la
              disponibilidad de la Plataforma o de determinadas funcionalidades
              por país o por perfil de Usuario por motivos legales, regulatorios
              o de riesgo.
            </p>
          </div>

          {/* 6. Registro y KYC/AML */}
          <div
            data-rail="Registro y KYC/AML"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              6. Registro, verificación de identidad y prevención de blanqueo
            </h2>
            <h3>6.1 Registro</h3>
            <p>
              El alta exige facilitar determinados datos y completar los
              procesos de verificación que se requieran. El Usuario es
              responsable de la veracidad y actualización de su información y de
              la confidencialidad de sus credenciales de acceso a la Plataforma.
            </p>
            <h3>6.2 Verificación obligatoria (KYC/KYB) previa</h3>
            <p>
              La superación de un proceso de verificación de identidad (KYC y,
              en su caso, KYB y verificación de origen de fondos) es un
              requisito obligatorio y previo para poder utilizar cualquier
              funcionalidad de la Plataforma que implique movimiento de
              Criptoactivos o de valor. Hasta que dicha verificación no haya
              sido aprobada, el Usuario únicamente podrá navegar por la
              Plataforma, sin posibilidad de fondear, intercambiar, transferir
              ni asignar Criptoactivos a Protocolos DeFi. La verificación se
              realiza a través de un proveedor especializado tercero e
              independiente (actualmente Sumsub, u otro que HYXORA designe) y/o
              de los Proveedores de Rampa, conforme a sus respectivos
              procedimientos. El Usuario se obliga a aportar información veraz,
              completa y actualizada. La aplicación de estos controles
              constituye una medida de mitigación de riesgo y de elegibilidad, y
              no implica que HYXORA preste servicios sujetos a autorización ni
              que asuma la condición de sujeto obligado en jurisdicción alguna.
            </p>
            <h3>6.3 Cribado de sanciones</h3>
            <p>
              El Usuario podrá ser objeto de cribado frente a listas de
              sanciones y de personas con responsabilidad pública (PEP), tanto
              en el alta como de forma periódica. HYXORA podrá bloquear, retener
              informacionalmente, restringir o rechazar el acceso, y comunicar a
              las autoridades competentes, cuando resulte legalmente exigible o
              razonablemente necesario.
            </p>
          </div>

          {/* 7. Wallet autocustodiada */}
          <div
            data-rail="Wallet Autocustodiada"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">7. Wallet autocustodiada</h2>
            <h3>7.1 Autocustodia</h3>
            <p>
              La Wallet Autocustodiada se genera y opera a través de la
              infraestructura del Proveedor de Wallet. El control de las claves
              o factores de autenticación que permiten disponer de los
              Criptoactivos corresponde exclusiva y únicamente al Usuario.
              HYXORA no genera, no conserva, no tiene acceso ni puede
              reconstruir por sí sola las claves privadas del Usuario, ni puede
              mover, bloquear o disponer unilateralmente de los Criptoactivos
              alojados en dicho monedero.
            </p>
            <h3>7.2 Recuperación de acceso</h3>
            <p>
              La eventual recuperación de acceso al monedero (por ejemplo,
              mediante factores de autenticación del propio Usuario) constituye
              una funcionalidad técnica del Proveedor de Wallet, sujeta a los
              términos de dicho tercero, y no implica que HYXORA preste un
              servicio de custodia ni que disponga de las claves del Usuario. El
              Usuario es el único responsable de conservar de forma segura sus
              factores de acceso y de adoptar copias de seguridad. La pérdida de
              dichos factores puede suponer la pérdida definitiva e irreversible
              del acceso a los Criptoactivos, sin que HYXORA pueda restituirlos.
            </p>
            <h3>7.3 Operaciones en cadena</h3>
            <p>
              Las operaciones con Criptoactivos se registran en redes blockchain
              públicas, son ejecutadas por el Usuario mediante su monedero y,
              una vez confirmadas, son definitivas e irreversibles. HYXORA no
              puede revertir, cancelar, modificar ni recuperar una operación, ni
              recuperar activos enviados a una dirección o red incorrecta. El
              Usuario es el único responsable de verificar direcciones, redes,
              importes y comisiones de red (gas) antes de operar.
            </p>
            <h3>7.4 Términos del Proveedor de Wallet</h3>
            <p>
              El uso del monedero puede estar sujeto, adicionalmente, a los
              términos y políticas del Proveedor de Wallet. HYXORA no responde
              de los actos, omisiones, disponibilidad, seguridad o fallos del
              Proveedor de Wallet.
            </p>
            <h3>
              7.5 Cuenta Inteligente y patrocinio de comisiones de red
              (Paymaster)
            </h3>
            <p>
              La Wallet Autocustodiada se implementa como Cuenta Inteligente
              mediante un contrato inteligente estándar y auditado de un
              tercero. El Usuario es el único titular y firmante autorizado de
              dicha Cuenta Inteligente. HYXORA no es titular ni cotitular, no
              dispone de llaves, módulos, guardianes, claves de recuperación,
              claves de sesión ni de ningún otro mecanismo que le permita
              firmar, iniciar, modificar, bloquear, congelar o disponer de los
              Criptoactivos del Usuario, ni revertir o censurar selectivamente
              sus operaciones.
            </p>
            <p>
              HYXORA podrá, como mejora de experiencia de usuario, asumir el
              costo de las comisiones de red (gas) mediante un mecanismo de
              Patrocinio de Comisiones de Red (Paymaster). Dicho patrocinio se
              limita estrictamente al pago del gas de operaciones que el propio
              Usuario inicia y firma criptográficamente, y no confiere a HYXORA
              control, titularidad, custodia ni capacidad de disposición o de
              iniciación de operación alguna sobre la Cuenta Inteligente. La
              Cuenta Inteligente, el Proveedor de Wallet y el mecanismo de
              Paymaster son tecnología de terceros sujeta a riesgo de contrato
              inteligente conforme a la cláusula 13; HYXORA no garantiza su
              disponibilidad, seguridad ni continuidad y podrá modificar o
              suspender el patrocinio de comisiones en cualquier momento.
            </p>
            <h3>7.6 Presentación de saldos y valores</h3>
            <p>
              Los saldos y posiciones del Usuario en la Plataforma —tanto en su
              Wallet Autocustodiada como en su acceso a Protocolos DeFi— se
              expresan en el criptoactivo subyacente correspondiente, que
              constituye la unidad funcional (por ejemplo, USDC, EUR-token, ETH
              y otros), identificándose cada activo por su símbolo. La
              Plataforma no mantiene, refleja ni representa saldos del Usuario
              en dinero fiat (euros o dólares).
            </p>
            <p>
              Cualquier importe que la Plataforma muestre en euros, dólares u
              otra divisa constituye únicamente un valor de referencia
              indicativo y aproximado, calculado a partir de datos de precio de
              terceros en un momento determinado, de carácter no vinculante, que
              puede variar de forma continua y diferir del valor efectivamente
              realizable. Dicho valor de referencia no representa fondos
              mantenidos por HYXORA en divisa, no constituye un saldo en cuenta
              ni un depósito, y se presenta de forma accesoria y diferenciada
              respecto de la cantidad de criptoactivo. Los criptoactivos
              referenciados a una divisa (incluidos los denominados «euro
              digital» o «dólar digital») son criptoactivos y no dinero fiat ni
              dinero electrónico de HYXORA. La indicación de un importe en
              divisa en el contexto exclusivo de una operación de conversión
              gestionada por un Proveedor de Rampa se entiende referida a dicho
              tercero conforme a la cláusula 8.
            </p>
          </div>

          {/* 8. Rampas de entrada y salida */}
          <div
            data-rail="Rampas On/Off-Ramp"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              8. Rampas de entrada y salida (on-ramp / off-ramp) e IBAN
            </h2>
            <h3>8.1 Servicios prestados por terceros</h3>
            <p>
              La conversión entre dinero fiat y Criptoactivos, así como, en su
              caso, los servicios de cuenta, identificadores de tipo IBAN,
              transferencias o pagos asociados, son prestados íntegramente por
              Proveedores de Rampa terceros e independientes, autorizados en sus
              respectivas jurisdicciones. HYXORA se limita a poner a disposición
              la interfaz técnica que permite al Usuario contratar y utilizar
              dichos servicios; HYXORA no es parte de la relación de pago, no
              recibe ni mantiene fondos fiat del Usuario y no presta servicios
              de pago ni de dinero electrónico.
            </p>
            <p>
              La conversión es ejecutada por el Proveedor de Rampa, recibiendo
              el Usuario los Criptoactivos resultantes directamente en su Wallet
              Autocustodiada. Cualquier comisión de HYXORA retribuye
              exclusivamente el uso de la interfaz de software, es independiente
              de la operación de pago o de conversión gestionada por el
              Proveedor de Rampa y no se detrae del importe de dinero fiat
              tramitado por éste.
            </p>
            <h3>8.2 Términos del proveedor</h3>
            <p>
              La prestación de estos servicios se rige por los términos,
              comisiones, límites, plazos de liquidación y procesos de
              verificación del Proveedor de Rampa correspondiente, que el
              Usuario acepta directamente con dicho tercero. HYXORA no garantiza
              la disponibilidad, los tiempos, los tipos de cambio ni el
              resultado de tales servicios.
            </p>
            <h3>8.3 Funcionalidades futuras</h3>
            <p>
              Cualquier funcionalidad de identificador IBAN, cuenta en euros,
              tarjeta, transferencias SEPA u otras prestaciones anunciadas como
              «próximamente» no está operativa hasta su lanzamiento efectivo,
              podrá no estar disponible en todos los países, estará sujeta a
              elegibilidad y a condiciones específicas adicionales, y, en su
              caso, será prestada por terceros autorizados. Su anuncio no
              constituye oferta ni compromiso de prestación.
            </p>
          </div>

          {/* 9. Swap */}
          <div
            data-rail="Swap de Activos"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              9. Intercambio de activos digitales (swap)
            </h2>
            <h3>9.1 Ejecución por terceros</h3>
            <p>
              Las operaciones de Swap son instruidas por el Usuario y ejecutadas
              a través de proveedores de liquidez, agregadores, mercados o
              protocolos de terceros. HYXORA no actúa como contraparte ni como
              creador de mercado y no garantiza la obtención del mejor precio,
              la ausencia de deslizamiento (slippage) ni la ejecución.
            </p>
            <h3>9.2 Precios y riesgos</h3>
            <p>
              Los precios mostrados son indicativos y pueden variar hasta la
              confirmación de la operación por la volatilidad del mercado y las
              condiciones de liquidez. Pueden aplicarse comisiones de red y
              comisiones de terceros. El Usuario asume el riesgo de precio y
              reconoce que las operaciones, una vez ejecutadas en cadena, son
              irreversibles.
            </p>
          </div>

          {/* 10. Protocolos DeFi */}
          <div
            data-rail="Protocolos DeFi"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              10. Acceso a Protocolos DeFi de terceros
            </h2>
            <h3>10.1 Naturaleza</h3>
            <p>
              La funcionalidad denominada «Protocolos DeFi» es una interfaz que
              permite al Usuario destinar, por su propia decisión y mediante su
              Wallet Autocustodiada, sus Criptoactivos a Protocolos DeFi de
              terceros independientes (incluidos sus contratos inteligentes y
              curadores). El Usuario interactúa de forma directa con dichos
              protocolos. HYXORA no opera, controla, gestiona, custodia ni
              administra los Protocolos DeFi, no agrupa («pool») fondos de
              usuarios, no ejerce discrecionalidad sobre las estrategias y no
              emite instrumento, participación ni valor alguno.
            </p>
            <h3>10.2 No es inversión colectiva ni depósito</h3>
            <p>
              El acceso a Protocolos DeFi no constituye fondos, fondos de
              inversión, instituciones de inversión colectiva, ETF, productos
              estructurados, valores negociables, «depósitos», «depósitos
              remunerados», «cuentas remuneradas» ni productos de ahorro o de
              inversión. No existe promesa de rentabilidad ni de preservación
              del capital. Cualquier rendimiento procede exclusivamente de la
              mecánica de los Protocolos DeFi de terceros, no es pagado,
              remunerado ni garantizado por HYXORA, y es variable. Ninguna
              métrica, rótulo o comunicación podrá denominar ni presentar el
              rendimiento como un «depósito remunerado» ni atribuirlo a HYXORA.
            </p>
            <h3>10.3 Selección no discrecional y sin idoneidad</h3>
            <p>
              La presentación de Protocolos DeFi responde a criterios objetivos,
              mecánicos y no personalizados (por ejemplo, métricas del propio
              protocolo), conforme a una metodología de carácter general que
              HYXORA podrá publicar, y no se basa en el perfil, los
              conocimientos, los objetivos ni la situación financiera del
              Usuario. No constituye recomendación, asesoramiento, evaluación de
              idoneidad o conveniencia, ni invitación a contratar. HYXORA no
              invierte ni decide por cuenta del Usuario; es el Usuario quien
              analiza, decide y firma cada interacción.
            </p>
            <h3>
              10.4 Información mostrada y ausencia de calificación de riesgo por
              HYXORA
            </h3>
            <p>
              Las cifras de «rendimiento anual estimado» (APY/APR), «capital
              gestionado» u otras métricas mostradas proceden de fuentes, datos
              en cadena y protocolos de terceros, se ofrecen únicamente con
              fines informativos, son estimaciones variables que cambian de
              forma continua, no son vinculantes y no constituyen previsión,
              garantía ni promesa de resultado.
            </p>
            <p>
              HYXORA no asigna, elabora ni expresa calificación, puntuación,
              nivel ni clasificación de riesgo alguna sobre los Protocolos DeFi.
              La información que se muestra se limita a (i) datos objetivos y
              verificables del propio protocolo o de la cadena, y (ii)
              información, auditorías o valoraciones de terceros independientes,
              en su caso, expresamente atribuidas a su fuente y no asumidas como
              criterio u opinión de HYXORA. La eventual presentación de un panel
              de riesgos es de carácter informativo, idéntico para todos los
              protocolos y no implica jerarquización, comparación cualitativa,
              valoración, recomendación ni evaluación de idoneidad o
              conveniencia por parte de HYXORA. Ningún dato o indicador debe
              interpretarse como garantía de seguridad ni como ausencia o
              reducción de riesgo: la pérdida total sigue siendo posible.
            </p>
            <h3>10.5 Riesgos específicos de los Protocolos DeFi</h3>
            <p>
              La interacción con Protocolos DeFi conlleva, entre otros, los
              siguientes riesgos, que el Usuario acepta asumir en su integridad:
            </p>
            <ul>
              <li>
                Riesgo de contrato inteligente: errores, vulnerabilidades,
                exploits, ataques o fallos de los protocolos o de sus
                dependencias (oráculos, puentes, etc.) que pueden provocar la
                pérdida total de los activos.
              </li>
              <li>
                Riesgo de terceros y de curador: actuaciones, errores o
                insolvencia de los protocolos, sus desarrolladores o curadores.
              </li>
              <li>
                Riesgo de stablecoins y de desanclaje (de-peg): pérdida de
                paridad o de respaldo de los activos referenciados.
              </li>
              <li>
                Riesgo de liquidez: imposibilidad de retirar fondos de forma
                inmediata o a la paridad esperada según las condiciones del
                protocolo.
              </li>
              <li>
                Riesgo de gobernanza, de cambios de parámetros, de migración o
                de cese del protocolo.
              </li>
              <li>
                Riesgo de mercado: variación del valor de los Criptoactivos,
                pudiendo llegar a cero.
              </li>
            </ul>
            <h3>10.6 Retiros</h3>
            <p>
              La disponibilidad y los plazos de retiro dependen exclusivamente
              de las condiciones técnicas y de liquidez de cada Protocolo DeFi y
              no son controlados ni garantizados por HYXORA.
            </p>
          </div>

          {/* 11. Asesoramiento e IA */}
          <div
            data-rail="Asesoramiento e IA"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              11. Ausencia de asesoramiento; herramientas informativas e IA
            </h2>
            <h3>11.1 Sin asesoramiento</h3>
            <p>
              Ningún contenido, dato, métrica, clasificación, material formativo
              («Academia»), comunicación, ni funcionalidad de asistencia
              automatizada o de inteligencia artificial disponible en la
              Plataforma constituye asesoramiento o recomendación de inversión,
              financiero, jurídico, contable ni fiscal, ni una oferta o
              invitación para adquirir o disponer de activo alguno. Tienen
              carácter exclusivamente informativo y general.
            </p>
            <h3>11.2 Asistente de inteligencia artificial</h3>
            <p>
              El asistente de inteligencia artificial integrado en la Plataforma
              está diseñado y destinado exclusivamente a proporcionar
              información de carácter general, explicar y aclarar conceptos,
              describir el funcionamiento de los Protocolos DeFi y de la
              Plataforma, explicar métricas y resumir riesgos, con una finalidad
              meramente educativa y orientativa. En ningún caso recomienda,
              aconseja, sugiere ni propone operación, activo, Protocolo DeFi,
              estrategia o decisión alguna, ni realiza valoraciones de idoneidad
              o conveniencia, ni emite llamadas a la acción, ni presta
              asesoramiento de inversión, financiero, jurídico, contable o
              fiscal, ni asesoramiento personalizado de ningún tipo.
            </p>
            <p>
              Su uso requiere el consentimiento previo del Usuario. Sus
              respuestas pueden ser inexactas, incompletas o desactualizadas y
              no deben tomarse como base única de ninguna decisión. La decisión
              de operar es adoptada por el Usuario de forma autónoma,
              independiente y bajo su exclusiva responsabilidad, totalmente
              desvinculada del asistente, recomendándose obtener asesoramiento
              profesional independiente. El tratamiento de datos asociado al
              asistente se rige por la Política de Privacidad.
            </p>
          </div>

          {/* 12. Comisiones y suscripciones */}
          <div
            data-rail="Comisiones y Suscripciones"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              12. Comisiones, planes de suscripción y reembolsos
            </h2>
            <h3>12.1 Comisiones</h3>
            <p>
              El uso de la Plataforma y de determinadas funcionalidades puede
              estar sujeto a comisiones y a planes de suscripción según la
              política de precios vigente publicada por HYXORA, que podrá
              modificarse conforme a la cláusula 21. Adicionalmente, podrán
              aplicarse comisiones de red (gas) y comisiones de terceros
              (Proveedores de Wallet, de Rampa, protocolos), ajenas a HYXORA.
            </p>
            <h3>12.2 Suscripciones y prueba</h3>
            <p>
              Los planes de suscripción se contratan por el periodo y precio
              indicados en el momento de la contratación y se renuevan según lo
              allí establecido, salvo cancelación. Cuando se ofrezca un periodo
              o modalidad de prueba con derecho de reembolso, este se regirá por
              las condiciones específicas publicadas para dicha promoción. Las
              comisiones de red y de terceros ya devengadas no son
              reembolsables.
            </p>
            <h3>12.3 Impuestos</h3>
            <p>
              Los precios pueden no incluir impuestos. El Usuario es el único
              responsable de determinar, declarar y pagar los tributos que se
              deriven de su actividad.
            </p>
          </div>

          {/* 13. Riesgos */}
          <div
            data-rail="Advertencia de Riesgos"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              13. Advertencia de riesgos
            </h2>
            <p>
              El Usuario declara comprender y aceptar, con carácter enunciativo
              y no limitativo, los siguientes riesgos:
            </p>
            <ul>
              <li>
                Volatilidad y pérdida total: el valor de los Criptoactivos puede
                fluctuar drásticamente y llegar a cero; el Usuario puede perder
                la totalidad de sus activos.
              </li>
              <li>
                Irreversibilidad: las operaciones en blockchain son definitivas
                y no pueden anularse ni revertirse.
              </li>
              <li>
                Tecnología: fallos, interrupciones, congestión de red,
                bifurcaciones (forks), ataques, vulnerabilidades de contratos
                inteligentes y errores de software.
              </li>
              <li>
                Pérdida de acceso: la pérdida de claves o factores de
                autenticación implica la pérdida irreversible de los activos,
                sin posibilidad de restitución por HYXORA.
              </li>
              <li>
                Terceros: dependencia de Proveedores de Wallet, Proveedores de
                Rampa y Protocolos DeFi, sobre cuyos actos, solvencia, seguridad
                y continuidad HYXORA no tiene control.
              </li>
              <li>
                Ausencia de garantías públicas: la actividad del Usuario no está
                cubierta por fondo de garantía de depósitos ni por esquema de
                indemnización de inversores.
              </li>
              <li>
                Incertidumbre regulatoria: el marco legal de los criptoactivos y
                de DeFi es incipiente y cambiante; cambios normativos pueden
                afectar a la disponibilidad de servicios o al valor de los
                activos, incluso de forma retroactiva.
              </li>
              <li>
                Fiscalidad: la operativa puede generar obligaciones tributarias
                a cargo exclusivo del Usuario.
              </li>
              <li>
                Ciberseguridad: riesgo de phishing, fraude, suplantación y
                acceso no autorizado a los dispositivos o credenciales del
                Usuario.
              </li>
            </ul>
            <p className="font-bold uppercase text-sm tracking-wide">
              El Usuario no debe destinar a estas actividades fondos cuya
              pérdida no pueda asumir.
            </p>
          </div>

          {/* 14. Obligaciones del Usuario */}
          <div
            data-rail="Obligaciones del Usuario"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              14. Obligaciones y conducta del Usuario
            </h2>
            <p>El Usuario se obliga a:</p>
            <ul>
              <li>
                utilizar la Plataforma conforme a la ley, la buena fe y estos
                Términos;
              </li>
              <li>
                no emplear la Plataforma para blanqueo de capitales,
                financiación del terrorismo, elusión de sanciones, fraude,
                estafa, evasión fiscal ni ninguna actividad ilícita;
              </li>
              <li>
                no operar con fondos o Criptoactivos de origen ilícito o de
                terceros sin legitimación;
              </li>
              <li>
                no vulnerar, manipular, descompilar, sobrecargar ni interferir
                en la Plataforma o su seguridad, ni utilizar bots o medios
                automatizados no autorizados;
              </li>
              <li>
                mantener la confidencialidad de sus credenciales y la seguridad
                de sus dispositivos y factores de acceso;
              </li>
              <li>
                facilitar información veraz y mantenerla actualizada, y cumplir
                sus obligaciones fiscales y legales.
              </li>
            </ul>
          </div>

          {/* 15. Cumplimiento y sanciones */}
          <div
            data-rail="Cumplimiento y Sanciones"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              15. Cumplimiento, sanciones internacionales y bloqueo
            </h2>
            <h3>15.1 Compromiso de cumplimiento</h3>
            <p>
              El Usuario declara y garantiza que cumple y cumplirá la normativa
              de prevención de blanqueo de capitales y de sanciones financieras
              internacionales que le resulte aplicable, y que no es ni actúa por
              cuenta de una persona sancionada o restringida.
            </p>
            <h3>15.2 Facultades de HYXORA</h3>
            <p>
              HYXORA podrá, en la medida en que resulte legalmente procedente o
              razonablemente necesario, suspender o restringir el acceso, no
              completar operaciones, requerir información, conservar registros y
              comunicar información a autoridades y proveedores cuando existan
              indicios de incumplimiento, operativa sospechosa, requerimiento de
              autoridad competente o exigencia legal o regulatoria. En la medida
              permitida por la ley, HYXORA podrá no informar previamente al
              Usuario de tales medidas.
            </p>
          </div>

          {/* 16. Propiedad intelectual */}
          <div
            data-rail="Propiedad Intelectual"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">16. Propiedad intelectual</h2>
            <h3>16.1 Titularidad</h3>
            <p>
              El Contenido de la Plataforma es titularidad de HYXORA o de sus
              licenciantes y está protegido por la normativa de propiedad
              intelectual e industrial. Se concede al Usuario una licencia
              limitada, no exclusiva, intransferible y revocable para usar la
              Plataforma con la única finalidad prevista en estos Términos.
            </p>
            <h3>16.2 Restricciones</h3>
            <p>
              Queda prohibido copiar, modificar, distribuir, realizar ingeniería
              inversa, explotar comercialmente o crear obras derivadas del
              Contenido de la Plataforma sin autorización escrita de HYXORA. Las
              marcas de terceros pertenecen a sus respectivos titulares; su
              mención no implica patrocinio ni asociación.
            </p>
          </div>

          {/* 17. Protección de datos */}
          <div
            data-rail="Protección de Datos"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              17. Protección de datos personales
            </h2>
            <p>
              El tratamiento de datos personales se rige por la Política de
              Privacidad (https://hyxora.com/privacy), que el Usuario debe leer
              y que forma parte de estos Términos. Dicha política informa, entre
              otros aspectos, sobre el responsable del tratamiento, las
              finalidades y bases de legitimación, las transferencias
              internacionales de datos (incluidas, en su caso, hacia la
              República de Panamá y a proveedores terceros), los plazos de
              conservación y los derechos del Usuario y su ejercicio.
              Determinados tratamientos derivados de obligaciones de
              identificación y cumplimiento pueden ser realizados por
              proveedores terceros en condición de responsables o encargados
              según corresponda.
            </p>
          </div>

          {/* 18. Suspensión y terminación */}
          <div
            data-rail="Suspensión y Terminación"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              18. Suspensión, restricción y terminación
            </h2>
            <h3>18.1 Por el Usuario</h3>
            <p>
              El Usuario puede cesar en el uso de la Plataforma en cualquier
              momento. Al tratarse de una Wallet Autocustodiada, el Usuario
              conserva en todo momento el control de sus claves y activos y
              podrá exportar o seguir gestionando su monedero por medios
              compatibles con independencia del cierre de su cuenta en la
              Plataforma.
            </p>
            <h3>18.2 Por HYXORA</h3>
            <p>
              HYXORA podrá suspender, restringir o terminar el acceso del
              Usuario, total o parcialmente, de forma inmediata, en caso de
              incumplimiento de estos Términos, condición de Persona
              Restringida, exigencia legal o regulatoria, riesgo de seguridad o
              de cumplimiento, o cese del servicio. La terminación no afecta al
              control que el Usuario mantiene sobre su Wallet Autocustodiada,
              sin perjuicio de que pueda perder el acceso a la interfaz y a las
              funcionalidades de la Plataforma.
            </p>
            <h3>18.3 Discontinuación</h3>
            <p>
              HYXORA podrá modificar, suspender o discontinuar la Plataforma o
              cualquiera de sus funcionalidades, en todo o en parte, de forma
              temporal o definitiva, procurando, cuando sea razonablemente
              posible, un preaviso al Usuario.
            </p>
          </div>

          {/* 19. Limitación de responsabilidad */}
          <div
            data-rail="Limitación de Responsabilidad"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              19. Exención y limitación de responsabilidad
            </h2>
            <h3>19.1 «Tal cual»</h3>
            <p>
              La Plataforma se proporciona «tal cual» y «según disponibilidad»,
              sin garantías de ningún tipo, expresas o implícitas, incluidas las
              de comerciabilidad, idoneidad para un fin, disponibilidad
              continuada, seguridad o ausencia de errores.
            </p>
            <h3>19.2 Exclusiones</h3>
            <p>
              En la máxima medida permitida por la ley aplicable, HYXORA, sus
              socios, administradores, empleados y colaboradores no responderán
              por:
            </p>
            <ul>
              <li>
                (a) pérdidas de valor, de Criptoactivos o de oportunidad
                derivadas de la volatilidad, del mercado o de decisiones del
                Usuario;
              </li>
              <li>
                (b) actos, omisiones, fallos, insolvencia o seguridad de
                Proveedores de Wallet, Proveedores de Rampa, Protocolos DeFi u
                otros terceros;
              </li>
              <li>
                (c) fallos de contratos inteligentes, de blockchain, forks,
                ataques o exploits;
              </li>
              <li>(d) pérdida de claves o factores de acceso del Usuario;</li>
              <li>
                (e) operaciones erróneas, irreversibles o a direcciones/redes
                incorrectas;
              </li>
              <li>
                (f) interrupciones, indisponibilidad o errores de la Plataforma;
              </li>
              <li>
                (g) daños indirectos, lucro cesante, pérdida de datos o daños
                consecuenciales.
              </li>
            </ul>
            <h3>19.3 Límite cuantitativo</h3>
            <p>
              En la máxima medida permitida por la ley, la responsabilidad
              agregada de HYXORA frente al Usuario por cualquier reclamación
              relacionada con la Plataforma se limitará al importe de las
              comisiones de suscripción efectivamente abonadas por el Usuario a
              HYXORA en los doce (12) meses anteriores al hecho que motive la
              reclamación.
            </p>
            <h3>19.4 Salvedad imperativa</h3>
            <p>
              Ninguna disposición de estos Términos excluye o limita la
              responsabilidad que no pueda excluirse o limitarse conforme a la
              ley imperativa aplicable (por ejemplo, por dolo o culpa grave), ni
              los derechos que, en su caso, correspondan al Usuario en virtud de
              normas imperativas de protección de los consumidores de su país de
              residencia que resulten aplicables y no sean renunciables.
            </p>
          </div>

          {/* 20. Indemnidad */}
          <div
            data-rail="Indemnidad"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">20. Indemnidad</h2>
            <p>
              El Usuario mantendrá indemne a HYXORA y a las personas indicadas
              en la cláusula 19.2 frente a cualquier reclamación, pérdida, daño,
              sanción, costo o gasto razonable (incluidos honorarios de defensa
              jurídica) derivados de:
            </p>
            <ul>
              <li>
                (a) el incumplimiento por el Usuario de estos Términos o de la
                ley;
              </li>
              <li>(b) el uso indebido de la Plataforma;</li>
              <li>(c) la inexactitud de sus declaraciones;</li>
              <li>(d) la infracción de derechos de terceros.</li>
            </ul>
          </div>

          {/* 21. Modificaciones */}
          <div
            data-rail="Modificaciones"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              21. Modificaciones de los Términos
            </h2>
            <p>
              HYXORA podrá modificar estos Términos por motivos legales,
              regulatorios, de seguridad, operativos o de evolución del
              servicio. Las modificaciones se publicarán en la Plataforma
              indicando su fecha de entrada en vigor y, cuando sean
              sustanciales, se procurará un aviso razonable. El uso continuado
              de la Plataforma tras la entrada en vigor implica la aceptación de
              la versión modificada. Si el Usuario no la acepta, deberá cesar en
              el uso de la Plataforma.
            </p>
          </div>

          {/* 22. Disposiciones generales */}
          <div
            data-rail="Disposiciones Generales"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              22. Disposiciones generales
            </h2>
            <h3>22.1 Cesión</h3>
            <p>
              El Usuario no podrá ceder su posición sin consentimiento escrito
              de HYXORA. HYXORA podrá ceder estos Términos a entidades de su
              grupo o en operaciones societarias, informando al Usuario.
            </p>
            <h3>22.2 Divisibilidad</h3>
            <p>
              La nulidad de una cláusula no afectará a la validez de las
              restantes, que se interpretarán para preservar al máximo su
              finalidad.
            </p>
            <h3>22.3 Integridad</h3>
            <p>
              Estos Términos y los documentos a los que remiten constituyen el
              acuerdo íntegro entre las partes respecto de su objeto.
            </p>
            <h3>22.4 No renuncia</h3>
            <p>
              La tolerancia o el no ejercicio de un derecho por HYXORA no
              constituye renuncia al mismo.
            </p>
            <h3>22.5 Fuerza mayor</h3>
            <p>
              HYXORA no responderá por incumplimientos debidos a causas ajenas a
              su control razonable, incluidos fallos de redes blockchain, de
              terceros, de telecomunicaciones, ciberataques, cambios normativos
              o supuestos de fuerza mayor.
            </p>
            <h3>22.6 Comunicaciones</h3>
            <p>
              Las comunicaciones de HYXORA al Usuario podrán realizarse a través
              de la Plataforma o por los medios de contacto facilitados por el
              Usuario, que se considerarán válidos.
            </p>
            <h3>22.7 Idioma</h3>
            <p>
              La versión en español de estos Términos es la versión oficial y
              prevalente. Las traducciones a otros idiomas se facilitan
              únicamente por comodidad; en caso de discrepancia prevalecerá la
              versión en español.
            </p>
            <h3>22.8 Supervivencia</h3>
            <p>
              Las cláusulas que por su naturaleza deban subsistir tras la
              terminación (en particular, 4, 13, 19, 20, 23) permanecerán en
              vigor.
            </p>
          </div>

          {/* 23. Ley aplicable y disputas */}
          <div
            data-rail="Ley Aplicable y Disputas"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              23. Ley aplicable y resolución de disputas
            </h2>
            <h3>23.1 Ley aplicable</h3>
            <p>
              Estos Términos se rigen por las leyes de la República de Panamá,
              sin perjuicio de las normas imperativas de protección de los
              consumidores que, en su caso, resulten aplicables al Usuario por
              su lugar de residencia y no sean renunciables.
            </p>
            <h3>23.2 Negociación previa</h3>
            <p>
              Antes de iniciar cualquier procedimiento, las partes intentarán
              resolver la controversia de buena fe mediante negociación durante
              un plazo de 30 días desde la notificación escrita.
            </p>
            <h3>23.3 Arbitraje</h3>
            <p>
              Toda controversia derivada de estos Términos o relacionada con
              ellos que no se resuelva amistosamente se someterá, con renuncia a
              cualquier otro fuero, a arbitraje de derecho administrado por el
              Centro de Conciliación y Arbitraje de Panamá, conforme a su
              reglamento vigente. El tribunal estará compuesto por un árbitro;
              la sede del arbitraje será Ciudad de Panamá; el idioma será el
              español; y el laudo será definitivo y vinculante. En la medida
              permitida por la ley, las partes renuncian a las acciones
              colectivas y a la acumulación de reclamaciones.
            </p>
            <h3>23.4 Consumidores</h3>
            <p>
              Cuando el Usuario tenga la condición de consumidor y una norma
              imperativa le reconozca el derecho a acudir a los tribunales o a
              un mecanismo de resolución de su lugar de residencia, lo dispuesto
              en esta cláusula se entenderá sin perjuicio de dicho derecho.
            </p>
          </div>

          {/* 24. Contacto */}
          <div data-rail="Contacto" className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">24. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con estos Términos, el Usuario
              puede dirigirse a: future@hyxora.com (asuntos generales) y
              legal@hyxora.com (asuntos legales), o a la dirección postal
              indicada en la cláusula 1.1.
            </p>
          </div>
        </div>

        <p className="text-sm text-t-secondary border-t border-gray-200 dark:border-gray-700 pt-6">
          Al pulsar «Acepto», registrarse o utilizar la Plataforma, el Usuario
          manifiesta haber leído, comprendido y aceptado íntegramente estos
          Términos y Condiciones, así como la Política de Privacidad.
        </p>
      </section>
      <div data-rail="Comisiones y Tarifas" data-rail-accent="true">
        <FeesTable />
      </div>
      <SectionRail />
    </Layout>
  );
};

export default TermsPage;
