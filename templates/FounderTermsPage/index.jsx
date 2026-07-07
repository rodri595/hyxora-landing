"use client";

import Layout from "@/components/Layout";
import SectionRail from "@/templates/TermsPage/SectionRail";

const TermsPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col gap-[130px] maxmd:gap-[80px] py-[100px]"
    >
      <section className="flex flex-col gap-8 max-w-[1370px] mx-auto w-full py-10 px-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">Términos y Condiciones</h1>
          <p className="text-base font-medium text-t-secondary">
            NFT Founder — Términos Generales de Contratación
          </p>
          <p className="text-sm text-gray-400">
            Última actualización: mayo 2026
          </p>
        </div>

        <div className="flex flex-col gap-6 text-base leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:leading-relaxed">
          {/* Información General */}
          <div
            data-rail="Información General"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">Información General</h2>
            <p>
              <strong>Emisor / Vendedor:</strong> HYXORA FINANCE, SL.
              (&quot;HYXORA&quot; o la &quot;Compañía&quot;), con domicilio
              social en Valdemoro (Madrid), c/ Ana Frank nº 69, NIF B24879702.
            </p>
            <p>
              <strong>Idioma:</strong> La versión en español prevalece, salvo
              que la Compañía publique expresamente una versión bilingüe con
              cláusula de prevalencia distinta.
            </p>
          </div>

          {/* Alcance y Finalidad */}
          <div
            data-rail="Alcance y Finalidad"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              Alcance y Finalidad del Documento
            </h2>
            <p>
              <strong>1. Qué SÍ regula:</strong> estos Términos se aplican
              exclusivamente a (i) la venta primaria de los NFT por HYXORA; (ii)
              la entrega digital mediante transferencia en la red blockchain
              correspondiente; y (iii) las condiciones básicas para que, en su
              caso, el Titular pueda vincular el NFT y activar Founder Perks
              conforme a las reglas del ecosistema HYXORA.
            </p>
            <p>
              <strong>2. Qué NO regula:</strong> estos Términos no regulan la
              prestación de los servicios principales de Hyxora (por ejemplo,
              cuenta de usuario, wallet, funcionalidades cripto, acceso a pools
              o productos, ni integraciones con terceros), ni tampoco la
              provisión de servicios de pago/dinero electrónico (p. ej., IBAN o
              tarjetas) que, en su caso, puedan ser ofrecidos por proveedores
              regulados. Todo ello quedará sujeto a condiciones, políticas y
              contratos independientes, con sus propios requisitos (incluyendo,
              cuando aplique, procesos de verificación KYC/AML).
            </p>
          </div>

          {/* Advertencia */}
          <div
            data-rail="Advertencia Legal"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              Advertencia: esto no es una oferta de valores ni un producto de
              inversión
            </h2>
            <p>
              La adquisición de un NFT Founder no constituye una oferta de
              valores, una oferta pública de inversión, un producto financiero o
              bancario, ni un instrumento de inversión, ahorro o depósito. El
              NFT Founder se concibe como un activo digital de carácter
              principalmente utilitario y comunitario, cuyo contenido y alcance
              se define en estos Términos. HYXORA no presta asesoramiento
              financiero, legal o fiscal mediante la venta del NFT, y el Usuario
              reconoce que la adquisición de activos digitales conlleva riesgos
              tecnológicos, regulatorios y de mercado.
            </p>
          </div>

          {/* 1. Aceptación */}
          <div
            data-rail="Aceptación del Contrato"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              1. Aceptación, Naturaleza del Contrato y Manifestaciones del
              Usuario
            </h2>
            <p>
              <strong>1.1.</strong> Los presentes términos y condiciones (los
              &quot;Términos&quot; o el &quot;Acuerdo&quot;) constituyen un
              contrato de adhesión jurídicamente vinculante entre HYXORA y
              cualquier persona física o jurídica que, directa o indirectamente:
              (i) acceda a la página o interfaz habilitada por HYXORA para la
              adquisición de los NFT Founder; (ii) efectúe un pago destinado a
              la compra; (iii) ejecute una transacción de acuñación
              (&quot;mint&quot;) o recepción; o (iv) posea, mantenga o
              transfiera un NFT Founder y pretenda activar los Beneficios
              asociados. La aceptación se entiende producida desde el primer
              acto concluyente de adquisición o interacción relevante (p. ej.,
              confirmación de compra, firma de mensaje con wallet, ejecución de
              transacción on-chain). Si el Usuario no está de acuerdo con estos
              Términos, debe abstenerse de adquirir el NFT y de utilizar
              cualquier interfaz de compra.
            </p>
            <p>
              <strong>1.2.</strong> El Usuario declara y garantiza que:
            </p>
            <ul>
              <li>
                a. es mayor de edad y tiene plena capacidad jurídica para
                obligarse;
              </li>
              <li>
                b. si actúa en nombre de una persona jurídica o tercero, cuenta
                con facultades suficientes para vincularlo;
              </li>
              <li>
                c. la adquisición no infringe normas aplicables en su
                jurisdicción (incluyendo restricciones a la compra de
                criptoactivos o activos digitales); y
              </li>
              <li>
                d. no adquirirá los NFT con fines ilícitos, fraudulentos o
                contrarios a la buena fe.
              </li>
            </ul>
            <p>
              <strong>1.3.</strong> El Usuario reconoce que no ha basculado su
              decisión de compra en declaraciones ajenas a este Acuerdo o a
              comunicaciones no oficiales de HYXORA. En particular, el Usuario
              acepta que: (i) contenidos en redes sociales, foros, chats o
              comunicaciones de terceros no constituyen garantías; y (ii)
              cualquier material promocional será interpretado de manera
              coherente con el presente Acuerdo.
            </p>
          </div>

          {/* 2. Definiciones */}
          <div
            data-rail="Definiciones"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              2. Definiciones e Interpretación
            </h2>
            <p>
              <strong>2.1. Definiciones.</strong> A efectos de estos Términos:
            </p>
            <p>
              <strong>&quot;NFT Founder&quot; o &quot;NFT&quot;:</strong> activo
              digital no fungible identificado por un token ID único, emitido
              mediante un contrato inteligente (&quot;Smart Contract&quot;)
              desplegado en la red blockchain XXXXX bajo estándar ERC-721, con
              metadatos asociados.
            </p>
            <p>
              <strong>&quot;Venta Primaria&quot;</strong> significa la primera
              transmisión onerosa del NFT por HYXORA al Usuario.
            </p>
            <p>
              <strong>&quot;Mercado Secundario&quot;</strong> supone las
              transmisiones posteriores entre terceros, fuera de la Venta
              Primaria.
            </p>
            <p>
              <strong>&quot;Wallet&quot;</strong> es una dirección blockchain
              compatible, controlada por el Usuario o por un tercero (incluido
              un proveedor) mediante claves privadas.
            </p>
            <p>
              <strong>
                &quot;Beneficios&quot; o &quot;Founder Perks&quot;
              </strong>{" "}
              son ventajas de uso y/o acceso definidas en el Anexo I, sujetas a
              condiciones.
            </p>
            <p>
              <strong>&quot;Proveedores de Pago&quot;</strong> se refiere a
              terceros independientes (p. ej., Stripe, MoonPay u otros) que
              procesan pagos fiat, conversiones o verificaciones.
            </p>
            <p>
              <strong>&quot;KYC/AML&quot;</strong> son procedimientos de
              identificación, verificación, prevención de blanqueo de capitales
              y financiación del terrorismo, y screening de sanciones.
            </p>
            <p>
              <strong>2.2. Interpretación.</strong> Los encabezados son
              meramente orientativos. La nulidad de una cláusula no afectará a
              la validez del resto, salvo que ello altere sustancialmente el
              equilibrio contractual.
            </p>
          </div>

          {/* 3. Objeto */}
          <div
            data-rail="Objeto y Alcance"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              3. Objeto, Alcance y Separación de Servicios
            </h2>
            <p>
              <strong>3.1.</strong> El objeto de este Acuerdo es regular, de
              forma exclusiva y exhaustiva:
            </p>
            <ul>
              <li>
                a) las condiciones de emisión/acuñación y Venta Primaria de los
                NFT Founder;
              </li>
              <li>
                b) el precio, fases de venta, medios de pago y entrega on-chain;
              </li>
              <li>
                c) la vinculación del NFT a una cuenta Hyxora, cuando exista,
                exclusivamente a efectos de reconocimiento de Beneficios;
              </li>
              <li>
                d) el régimen de transmisibilidad a efectos de Beneficios; y
              </li>
              <li>
                e) las declaraciones, riesgos, limitaciones y responsabilidades
                asociadas a la compra del NFT.
              </li>
            </ul>
            <p>
              <strong>3.2.</strong> El Usuario reconoce y acepta que este
              Acuerdo no regula el uso de la plataforma de Hyxora como servicio
              (p. ej., wallet, funcionalidades cripto, acceso a pools,
              integraciones con entidades de pago, emisión de IBAN, tarjetas, o
              cualquier funcionalidad financiera o cuasi-financiera). Dichas
              materias, si se ofrecen, se regirán por condiciones específicas,
              políticas separadas y/o contratos con terceros, que el Usuario
              deberá aceptar de manera independiente.
            </p>
            <p>
              <strong>3.3.</strong> La compra de un NFT no constituye
              financiación garantizada ni impone a HYXORA obligación de alcanzar
              hitos, lanzar productos, mantener integraciones con terceros o
              sostener un roadmap. HYXORA actuará conforme a su criterio
              empresarial y a las exigencias legales y técnicas aplicables.
            </p>
          </div>

          {/* 4. Naturaleza jurídica */}
          <div
            data-rail="Naturaleza Jurídica"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              4. Naturaleza Jurídica del NFT Founder
            </h2>
            <p>
              <strong>4.1.</strong> El NFT Founder se concibe como un activo
              digital de carácter esencialmente de utilidad, destinado a
              habilitar Beneficios dentro del ecosistema de Hyxora y/o acceso a
              determinadas dinámicas comunitarias, en los términos del Anexo I.
            </p>
            <p>
              <strong>4.2.</strong> El Usuario acepta expresamente que la
              titularidad del NFT:
            </p>
            <ul>
              <li>
                a) no es una acción, participación social, obligación, nota
                convertible, préstamo, derivado, instrumento financiero ni valor
                negociable;
              </li>
              <li>
                b) no confiere derecho automático a dividendos, rentas,
                intereses, reembolsos ni retornos;
              </li>
              <li>
                c) no concede, por sí misma, derechos políticos societarios
                (voto) ni derechos económicos societarios (participación en
                beneficios) respecto de HYXORA;
              </li>
              <li>
                d) no constituye un contrato de inversión ni un producto de
                ahorro.
              </li>
            </ul>
            <p>
              <strong>4.3.</strong> HYXORA no presta asesoramiento financiero,
              legal, fiscal ni de inversión mediante la venta del NFT. El
              Usuario declara comprender que el precio pagado se corresponde con
              la adquisición del NFT y el acceso a Beneficios, y que cualquier
              apreciación, revalorización o precio de reventa, si existiere,
              depende de condiciones de mercado y terceros, sin que HYXORA
              garantice mercado secundario, liquidez ni precio mínimo.
            </p>
            <p>
              <strong>4.4.</strong> El Usuario se obliga a no interpretar,
              comunicar o representar la adquisición del NFT como una inversión
              garantizada, una oferta de valores o un instrumento de retorno
              económico. Asimismo, el Usuario reconoce que HYXORA podrá adoptar
              medidas para corregir comunicaciones engañosas, proteger a
              consumidores y mitigar riesgos regulatorios.
            </p>
          </div>

          {/* 5. Suministro */}
          <div
            data-rail="Suministro y Metadatos"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              5. Suministro, Características Técnicas y Metadatos
            </h2>
            <p>
              <strong>5.1.</strong> La colección &quot;NFT Founder&quot; estará
              limitada a un suministro máximo de 1.000 (mil) unidades. Cada NFT
              tendrá un identificador único (Token ID) y estará registrado en el
              Smart Contract correspondiente.
            </p>
            <p>
              <strong>5.2.</strong> HYXORA podrá reservar un número razonable de
              NFTs con fines operativos (p. ej., testing, auditoría técnica,
              marketing, partnerships o incentivos internos), siempre que: (i)
              se respete el límite máximo total; y (ii) se informe de manera
              transparente en la documentación pública del mint o en el Anexo
              correspondiente. En caso de incidencias técnicas, HYXORA podrá
              implementar correcciones razonables, incluyendo actualización de
              metadatos o migraciones, siempre procurando respetar el carácter
              único del NFT y sin alterar de forma arbitraria los elementos
              esenciales ofrecidos.
            </p>
            <p>
              <strong>5.3.</strong> El NFT se emite en la red XXXXXXX. El
              Usuario asume:
            </p>
            <ul>
              <li>
                a) comisiones de red (&quot;gas fees&quot;) y su variabilidad;
              </li>
              <li>
                b) congestión, retrasos, reorganizaciones, forks, riesgos de
                compatibilidad y cambios de reglas;
              </li>
              <li>
                c) que transacciones confirmadas pueden ser irreversibles; y
              </li>
              <li>
                d) que el control del NFT depende del control efectivo de la
                Wallet.
              </li>
            </ul>
          </div>

          {/* 6. Elegibilidad */}
          <div
            data-rail="Elegibilidad y KYC"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              6. Elegibilidad, KYC/AML, Sanciones y Restricciones
            </h2>
            <p>
              <strong>6.1.</strong> HYXORA y/o los Proveedores de Pago podrán
              exigir, como condición previa o posterior a la compra y/o a la
              activación de Beneficios, que el Usuario complete procesos
              KYC/AML, aportando documentos y declaraciones (incluyendo prueba
              de identidad, domicilio, origen de fondos y titularidad real si
              actúa una persona jurídica).
            </p>
            <p>
              <strong>6.2.</strong> HYXORA podrá, sin incurrir en
              responsabilidad: (a) rechazar compras; (b) suspender la entrega de
              Beneficios; (c) bloquear el acceso a determinadas funcionalidades;
              o (d) resolver el Acuerdo respecto del Usuario, si existen
              indicios razonables de fraude, blanqueo, sanciones, suplantación
              de identidad, uso de fondos ilícitos, o incumplimiento de normas
              aplicables o políticas internas de cumplimiento.
            </p>
            <p>
              <strong>6.3.</strong> La venta puede no estar disponible en
              determinadas jurisdicciones o para determinadas categorías de
              personas. El Usuario es responsable de verificar la legalidad de
              adquirir y poseer NFTs en su jurisdicción.
            </p>
          </div>

          {/* 7. Proveedores de Pago */}
          <div
            data-rail="Proveedores de Pago"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">7. Proveedores de Pago</h2>
            <p>
              <strong>7.1.</strong> Stripe, MoonPay y demás Proveedores de Pago
              actúan como terceros independientes. HYXORA no controla sus
              decisiones de aceptación, verificación, comisiones, retenciones,
              chargebacks, devoluciones o bloqueos.
            </p>
            <p>
              <strong>7.2.</strong> La compra puede requerir aceptar términos,
              políticas de privacidad y/o KYC de terceros. El Usuario reconoce
              que: (a) la compra puede ser denegada por el proveedor; (b) el
              proveedor puede retener fondos por revisión; y (c) el proveedor
              puede exigir información adicional.
            </p>
            <p>
              <strong>7.3.</strong> Si se produce un contracargo
              (&quot;chargeback&quot;), disputa o reversión, HYXORA podrá: (a)
              suspender Beneficios asociados; (b) iniciar acciones de recobro;
              y/o (c) invalidar la operación, en la medida legalmente posible.
            </p>
          </div>

          {/* 8. Perfección del Contrato */}
          <div
            data-rail="Perfección del Contrato"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              8. Perfección del Contrato
            </h2>
            <p>
              <strong>8.1.</strong> La compra se considera perfeccionada cuando
              concurran, conjuntamente, la confirmación del pago por el
              proveedor y la transferencia efectiva del NFT al wallet indicado o
              al mecanismo técnico de recepción.
            </p>
            <p>
              <strong>8.2.</strong> El Usuario es el único responsable de
              proporcionar una dirección válida y de mantener control de su
              wallet. HYXORA no responde por pérdidas derivadas de direcciones
              erróneas, malware, phishing, pérdida de claves privadas, o
              custodia por terceros.
            </p>
            <p>
              <strong>8.3.</strong> Para activar Beneficios, HYXORA podrá exigir
              que el Usuario vincule su wallet a una cuenta Hyxora mediante
              firma criptográfica y, en su caso, KYC/AML. HYXORA solo reconocerá
              &quot;Beneficios&quot; al &quot;Titular verificado&quot; conforme
              a su sistema.
            </p>
          </div>

          {/* 9. Beneficios */}
          <div
            data-rail="Founder Perks"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              9. Beneficios de los Titulares de NFT Founder (Founder Perks)
            </h2>
            <p>
              <strong>9.1.</strong> Los &quot;Beneficios&quot; descritos en el
              Anexo I constituyen ventajas de uso, acceso, descuentos o
              priorizaciones dentro del ecosistema Hyxora. No constituyen
              rentas, retornos garantizados ni obligaciones pecuniarias a favor
              del Usuario.
            </p>
            <p>
              <strong>9.2.</strong> El disfrute de Beneficios requiere: (a)
              ostentar la titularidad on-chain del NFT; (b) vincular el NFT a la
              cuenta de usuario; (c) cumplir controles KYC/AML cuando proceda; y
              (d) mantener cumplimiento continuo (p. ej., no sanciones, no
              fraude).
            </p>
            <p>
              <strong>9.3.</strong> HYXORA podrá modificar, sustituir, limitar o
              discontinuar Beneficios cuando exista: (a) cambio regulatorio o
              requerimiento de autoridad; (b) necesidad técnica o de
              ciberseguridad; (c) discontinuación por terceros; (d) abuso del
              Usuario; o (e) necesidad empresarial justificada. HYXORA
              procurará, cuando sea razonablemente posible, ofrecer una
              alternativa funcionalmente equivalente.
            </p>
            <p>
              <strong>9.4.</strong> HYXORA podrá suspender Beneficios
              individualmente si el Usuario incumple el Acuerdo, realiza
              actividades abusivas, o se detectan riesgos de fraude, sin
              perjuicio de otras acciones.
            </p>
          </div>

          {/* 10. Programa de Participación */}
          <div
            data-rail="Participación Societaria"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              10. Programa Potencial de Participación Societaria
            </h2>
            <p>
              <strong>10.1.</strong> La titularidad de un NFT Founder podrá
              otorgar al Usuario, a discreción de HYXORA, una condición de
              elegibilidad para ser invitado a determinadas iniciativas futuras
              relacionadas con la comunidad (por ejemplo: acceso preferente a
              comunicaciones, eventos, pruebas beta, campañas o programas de
              fidelización).
            </p>
            <p>
              <strong>10.2.</strong> HYXORA podría valorar, en el futuro, la
              creación de mecanismos de participación societaria u otros
              esquemas de alineación con la comunidad. En tal caso, el Usuario
              reconoce que:
            </p>
            <ul>
              <li>
                a) el NFT no incorpora derecho automático, exigible ni
                &quot;convertible&quot; a participaciones sociales;
              </li>
              <li>
                b) cualquier mecanismo societario requerirá instrumentos
                jurídicos separados (pacto de socios, estatutos, acuerdos de
                inversión, etc.);
              </li>
              <li>
                c) HYXORA podrá imponer requisitos de elegibilidad por
                jurisdicción, categoría de inversor, límites cuantitativos,
                precio, lock-ups, derechos políticos/económicos, y cualquier
                otra condición necesaria; y
              </li>
              <li>
                d) HYXORA puede decidir no implementar nunca un programa de esta
                naturaleza, sin que ello genere responsabilidad.
              </li>
            </ul>
            <p>
              <strong>10.3.</strong> Si cualquier iniciativa futura pudiera ser
              calificada como oferta de valores, instrumento financiero o
              actividad regulada, HYXORA se reserva el derecho de: (i) no
              ejecutarla; (ii) limitarla geográficamente; (iii) canalizarla
              mediante estructuras conformes a la normativa; o (iv) exigir
              condiciones de inversor/AML reforzadas.
            </p>
          </div>

          {/* 11. Transferencias */}
          <div
            data-rail="Mercado Secundario"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              11. Transferencias, Mercado Secundario y Efectos sobre Beneficios
            </h2>
            <p>
              <strong>11.1.</strong> Salvo bloqueo técnico expresamente
              indicado, el NFT puede ser transferible on-chain. El Usuario
              reconoce que HYXORA no garantiza: (a) la existencia de mercado
              secundario; (b) la posibilidad de reventa; (c) un precio mínimo o
              máximo; ni (d) que terceros acepten comprar el NFT.
            </p>
            <p>
              <strong>11.2.</strong> En caso de transferencia del NFT: (a) el
              titular anterior pierde automáticamente la condición de
              &quot;Founder&quot; a efectos de &quot;Beneficios&quot;; (b) el
              nuevo adquirente podrá activar &quot;Beneficios&quot; únicamente
              si vincula el NFT y supera &quot;KYC/AML&quot; cuando proceda; (c)
              HYXORA podrá denegar activación si el nuevo titular está en
              jurisdicción restringida o no supera compliance.
            </p>
            <p>
              <strong>11.3.</strong> Si HYXORA habilita un marketplace interno,
              podrá establecer reglas operativas (comisiones, royalties,
              antifraude). El Usuario acepta que el uso del marketplace interno
              puede ser opcional y que la transferencia on-chain fuera de él
              puede producirse sin intervención de HYXORA.
            </p>
            <p>
              <strong>11.4.</strong> Si el Smart Contract incorpora royalties o
              comisiones por reventa, el Usuario los acepta como parte del
              diseño técnico del NFT. El Usuario reconoce que la ejecutabilidad
              de royalties puede variar según plataformas de terceros.
            </p>
          </div>

          {/* 12. Desistimiento */}
          <div
            data-rail="Desistimiento y Reembolsos"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              12. Desistimiento, Cancelaciones y Condiciones de Reembolso
            </h2>
            <p>
              <strong>12.1.</strong> Dada la naturaleza digital del NFT y la
              ejecución tecnológica inmediata (mint/transfer on-chain), el
              Usuario reconoce que los reembolsos son, por regla general,
              restrictivos, salvo obligación legal o error imputable a HYXORA.
            </p>
            <p>
              <strong>12.2.</strong> Si el Usuario actúa como consumidor, podrán
              aplicarse normas de consumo y contratación a distancia. En la
              medida legalmente permitida, el Usuario acepta que, si solicita o
              consiente la ejecución inmediata de la entrega digital del NFT, el
              derecho de desistimiento puede no resultar aplicable o puede
              perderse cuando se cumplan los requisitos legales.
            </p>
            <p>
              <strong>12.3.</strong> Si HYXORA o el proveedor de pagos cancela
              la compra por no superar KYC/AML o por señales de
              fraude/sanciones, HYXORA podrá gestionar reembolsos cuando
              proceda, deduciendo comisiones no recuperables de terceros, en la
              medida permitida por la ley.
            </p>
            <p>
              <strong>12.4.</strong> Si por causa imputable a HYXORA el NFT no
              puede entregarse o no se acuña correctamente, HYXORA podrá, a su
              elección: (i) reintentar la entrega; (ii) acuñar un NFT
              equivalente; o (iii) reembolsar el precio, salvo que el fallo
              derive de la wallet del Usuario o de la red.
            </p>
          </div>

          {/* 13. Riesgos */}
          <div
            data-rail="Riesgos"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">13. Riesgos</h2>
            <p>
              El Usuario declara comprender y aceptar, entre otros, los
              siguientes riesgos, que asume íntegramente:
            </p>
            <ul>
              <li>
                <strong>a) Riesgo tecnológico:</strong> bugs en smart contracts,
                vulnerabilidades, fallos de terceros, caídas de infraestructura,
                pérdida de metadatos, ataques a bridges o servicios asociados.
              </li>
              <li>
                <strong>b) Riesgo de custodia:</strong> pérdida de claves,
                hackeo de wallet, phishing, malware, SIM swapping.
              </li>
              <li>
                <strong>c) Riesgo de red:</strong> congestión, gas fees
                elevados, forks, reorgs, cambios de consenso.
              </li>
              <li>
                <strong>d) Riesgo de mercado:</strong> ausencia de liquidez,
                volatilidad, caídas de demanda, imposibilidad de reventa.
              </li>
              <li>
                <strong>e) Riesgo regulatorio:</strong> cambios legislativos o
                interpretativos que afecten a la venta, posesión, transferencias
                o reconocimiento de Beneficios.
              </li>
              <li>
                <strong>f) Riesgo fiscal:</strong> obligaciones tributarias
                variables por jurisdicción, reporting, valoración, plusvalías.
              </li>
              <li>
                <strong>g) Riesgo de terceros:</strong> decisiones de
                Stripe/MoonPay u otros (retenciones, bloqueos, rechazos,
                comisiones).
              </li>
              <li>
                <strong>h) Riesgo de continuidad:</strong> HYXORA puede
                modificar o discontinuar productos, integraciones o Beneficios
                por razones empresariales o legales.
              </li>
            </ul>
            <p>
              La asunción de riesgos es condición esencial del presente
              contrato.
            </p>
          </div>

          {/* 14. Propiedad Intelectual */}
          <div
            data-rail="Propiedad Intelectual"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">14. Propiedad Intelectual</h2>
            <p>
              <strong>14.1.</strong> Salvo indicación expresa en el Anexo I o en
              una licencia específica, HYXORA (o sus licenciantes) conserva
              todos los derechos de propiedad intelectual e industrial sobre:
              marca HYXORA, software, interfaces, documentación, diseños, arte,
              metadatos y contenidos asociados al NFT.
            </p>
            <p>
              <strong>14.2.</strong> Mientras el Usuario sea titular del NFT,
              HYXORA le concede una licencia: (a) no exclusiva, no transferible
              (salvo junto con la transferencia del NFT), revocable en caso de
              incumplimiento, y mundial; (b) para mostrar el arte asociado al
              NFT con fines personales, no comerciales, y para exhibición en
              marketplaces o galerías compatibles; (c) sin derecho a explotación
              comercial, sublicencia, modificación sustancial, registro como
              marca o uso publicitario masivo.
            </p>
            <p>
              <strong>14.3.</strong> Queda prohibido usar el NFT, su arte o
              denominaciones para: (a) actividades ilícitas; (b) contenidos
              ofensivos, difamatorios o de odio; (c) suplantación de HYXORA o
              confusión al consumidor; (d) emisión de productos derivados o
              merchandising sin autorización.
            </p>
          </div>

          {/* 15. Responsabilidad */}
          <div
            data-rail="Responsabilidad"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              15. Responsabilidad, Exenciones, Limitación y Fuerza Mayor
            </h2>
            <p>
              <strong>15.1.</strong> En la máxima medida permitida por ley,
              HYXORA no será responsable por: (a) fallos de blockchain o redes
              descentralizadas; (b) pérdidas por custodia del Usuario; (c)
              actuaciones u omisiones de Proveedores de Pago; (d) variaciones de
              valor del NFT; (e) ausencia de mercado secundario; (f) cambios
              regulatorios o decisiones de autoridades; (g) daños indirectos o
              lucro cesante.
            </p>
            <p>
              <strong>15.2.</strong> Salvo dolo o responsabilidad inderogable,
              la responsabilidad total de HYXORA frente al Usuario, por
              cualquier concepto relacionado con la Venta Primaria de un NFT, se
              limita al importe efectivamente pagado por dicho NFT en la Venta
              Primaria (excluyendo gas fees y comisiones de terceros).
            </p>
            <p>
              <strong>15.3.</strong> HYXORA no responderá por incumplimientos
              debidos a eventos fuera de su control razonable: caídas de
              proveedores, incidentes de red, hackeos sistémicos, decisiones
              regulatorias urgentes, guerras, sanciones, catástrofes, etc. En
              tales casos, HYXORA podrá suspender obligaciones afectadas
              mientras dure el evento.
            </p>
          </div>

          {/* 16. Duración */}
          <div
            data-rail="Duración"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">16. Duración</h2>
            <p>
              <strong>16.1.</strong> Este Acuerdo entra en vigor desde su
              aceptación y permanecerá vigente mientras el Usuario mantenga la
              titularidad del NFT o pretenda activar Beneficios, sin perjuicio
              de obligaciones que sobrevivan (riesgos, IP, responsabilidad,
              jurisdicción).
            </p>
            <p>
              <strong>16.2.</strong> HYXORA podrá resolver o limitar el Acuerdo
              respecto del Usuario si: (a) incumple Términos; (b) incurre en
              fraude o abuso; (c) no supera compliance; o (d) utiliza el NFT
              para fines ilícitos. La resolución podrá implicar la desactivación
              definitiva de Beneficios, sin afectar a la titularidad on-chain
              del NFT, pero sí al reconocimiento y utilidad dentro del
              ecosistema HYXORA.
            </p>
          </div>

          {/* 17. Modificaciones */}
          <div
            data-rail="Modificaciones"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">
              17. Modificaciones del Acuerdo
            </h2>
            <p>
              HYXORA podrá actualizar estos Términos por motivos legales,
              técnicos o de negocio. La versión vigente será la publicada con su
              Fecha de Actualización. Para Usuarios ya titulares, HYXORA
              procurará que los cambios no alteren de manera retroactiva
              condiciones esenciales de compra ya perfeccionadas, salvo
              obligación legal o necesidad de seguridad/compliance.
            </p>
          </div>

          {/* 18. Protección de Datos */}
          <div
            data-rail="Protección de Datos"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">18. Protección de Datos</h2>
            <p>
              El tratamiento de datos personales se regirá por la Política de
              Privacidad de HYXORA. El Usuario reconoce que para KYC/AML y
              prevención del fraude HYXORA y/o Proveedores de Pago podrán tratar
              y compartir datos conforme a la normativa aplicable y sus
              políticas.
            </p>
          </div>

          {/* 19. Ley Aplicable */}
          <div
            data-rail="Ley Aplicable y Foro"
            className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold">19. Ley Aplicable y Foro</h2>
            <p>
              Estos Términos se rigen por la ley de España. Para cualquier
              controversia, las partes se someten a los Juzgados y Tribunales de
              Valdemoro (Madrid), sin perjuicio de normas imperativas aplicables
              a consumidores.
            </p>
          </div>

          {/* 20. Disposiciones Finales */}
          <div
            data-rail="Disposiciones Finales"
            className="flex flex-col gap-3"
          >
            <h2 className="text-xl font-semibold">20. Disposiciones Finales</h2>
            <p>
              <strong>20.1.</strong> Estos Términos constituyen el acuerdo
              íntegro sobre la compra del NFT, sustituyendo acuerdos previos
              sobre el mismo objeto.
            </p>
            <p>
              <strong>20.2.</strong> Si una cláusula fuese nula o inaplicable,
              las demás permanecerán vigentes, y se interpretará la cláusula
              afectada de manera que se aproxime lo máximo posible a la
              intención original.
            </p>
            <p>
              <strong>20.3.</strong> El Usuario no podrá ceder su posición
              contractual (más allá de la transferencia on-chain del NFT) sin
              autorización. HYXORA podrá ceder el contrato en el marco de
              reorganizaciones societarias, ventas de unidad de negocio o
              sucesión empresarial, informando razonablemente al Usuario.
            </p>
            <p>
              <strong>20.4.</strong> Las notificaciones se realizarán por medios
              electrónicos a los datos facilitados por el Usuario, salvo
              exigencia legal de forma distinta.
            </p>
          </div>
        </div>
      </section>

      <SectionRail />
    </Layout>
  );
};

export default TermsPage;
