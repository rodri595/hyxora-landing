"use client";

import Layout from "@/components/Layout";

const PrivacyPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col gap-[130px] maxmd:gap-[80px] pt-[100px]"
    >
      <section className="flex flex-col gap-8 max-w-3xl mx-auto w-full py-10 px-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">Privacy Control</h1>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>Effective Date: 22/04/2025</span>
            <span>Last Updated: 15/07/2025</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 text-base leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:leading-relaxed">
          {/* 1. General Disclaimer */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">1. General Disclaimer</h2>
            <p>
              This platform does not offer financial services, issue payment
              instruments, nor hold or process customer funds. It is a user
              interface that facilitates access to third-party card programs.
              These services are operated and issued entirely by regulated
              financial institutions outside the European Economic Area. By
              using the platform, users acknowledge that they are entering into
              a contractual relationship directly with the card issuer or
              service provider, not with the platform operator.
            </p>
          </div>

          {/* 2. Description of Service */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p>
              This platform is a technology interface that enables users to
              access card services provided by authorized third-party financial
              providers located in jurisdictions such as Hong Kong. The platform
              does not issue cards, manage funds, or operate as a financial
              institution. Cards are issued and operated by regulated partners
              under their own licenses.
            </p>
          </div>

          {/* 3. Role of the Operator */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">3. Role of the Operator</h2>
            <p>
              The platform is operated by a technology company registered in
              Dubai, UAE. The operator provides only the platform interface and
              does not have access to user funds, card infrastructure, or
              transactional flows. All financial services are provided by
              third-party issuing partners.
            </p>
            <p>
              The platform is not a card issuer, financial institution, or
              electronic money institution. The cards accessible through this
              interface are issued by third-party providers operating under
              their own licensing and regulatory frameworks. The operator
              provides no guarantee, control, or liability regarding the
              compliance of such providers with local regulations in the
              user&apos;s country of residence. Users are solely responsible for
              ensuring their own legal and fiscal compliance in their
              jurisdiction.
            </p>
          </div>

          {/* 4. Registration and Verification */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">
              4. Registration and Verification (Soft KYC)
            </h2>
            <p>
              In compliance with international regulatory obligations, all users
              must complete a Soft KYC process in order to activate and use the
              card services accessible through the platform. This verification
              is performed through an external third-party provider and is
              designed to meet minimum compliance standards while preserving
              user privacy.
            </p>
            <p>
              The operator does not access, store, or directly control any
              personal identity data collected during the verification process.
              The identity of users remains unknown to the operator unless there
              is a legally binding requirement to obtain and disclose it in
              connection with a specific official request or investigation
              involving an individual user or a selected group of users.
            </p>
            <p>
              As long as users engage with the platform lawfully and
              responsibly, no personal information will be proactively or
              voluntarily disclosed to any public or governmental institution.
            </p>
            <p>
              This privacy-by-design approach enables the platform to offer one
              of the most privacy-conscious card experiences available while
              remaining compliant with the applicable legal frameworks of its
              financial partners.
            </p>
          </div>

          {/* 5. Use of the Card */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">5. Use of the Card</h2>
            <p>
              Cards accessed via this platform are governed by the terms and
              conditions of the issuing partner. Usage limits, acceptance, and
              settlement are controlled solely by the issuer. The platform does
              not impose or manage any card limits or functionality.
            </p>
          </div>

          {/* 6. Regulation and Jurisdiction */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">
              6. Regulation and Jurisdiction
            </h2>
            <p>
              <strong>6.1</strong> The service offered through this platform is
              operated by external third-party providers duly authorized in
              their respective jurisdictions, currently in Hong Kong. The
              platform does not act as a financial entity nor does it issue
              cards directly, and it holds no contractual relationship with the
              user regarding the custody or management of funds.
            </p>
            <p>
              <strong>6.2</strong> The platform does not actively promote or
              offer its services in jurisdictions where financial services may
              be restricted, licensed, or regulated, including but not limited
              to countries under international sanctions, or jurisdictions
              requiring prior regulatory authorization for the offering of
              financial instruments.
            </p>
            <p>
              <strong>6.2 bis</strong> The operator and its providers reserve
              the right to restrict or suspend access to the platform, in whole
              or in part, for users who reside in, access from, or attempt to
              operate from jurisdictions included in international sanctions
              lists, such as those issued by the U.S. Office of Foreign Assets
              Control (OFAC), the European Union, the United Nations, or other
              relevant authorities. This restriction applies even if the
              individual user is not personally sanctioned, in order to comply
              with internal risk policies and the compliance obligations of the
              issuing partners.
            </p>
            <p>
              <strong>6.3</strong> Any use of this platform by citizens or
              residents of the European Union, the United States of America, or
              other regulated jurisdictions is the sole responsibility of the
              user. The user acknowledges their duty to comply with applicable
              local laws, especially those related to taxation and capital
              controls.
            </p>
            <p>
              <strong>6.4</strong> These Terms and Conditions shall be governed
              by and construed in accordance with the laws of the jurisdiction
              in which the financial service providers operate (currently Hong
              Kong), expressly excluding the application of any other law or
              forum.
            </p>
          </div>

          {/* 7. Deposits, Holds and Refunds */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">
              7. Deposits, Holds and Refunds
            </h2>
            <p>
              <strong>7.1 Top-ups and Issuer Responsibility</strong>
              <br />
              When a user tops up a card through the platform, the deposit is
              made directly to the third-party card issuer, a regulated
              financial entity independent from the operator. The platform acts
              solely as a technology interface and does not manage, receive, or
              hold any funds. The legal relationship regarding the custody,
              availability, and conditions of the topped-up balance exists
              exclusively between the user and the issuer, according to the
              issuer&apos;s internal policies and terms.
            </p>
            <p>
              <strong>7.2 Processing of Refunds</strong>
              <br />
              Refunds related to card transactions (such as purchase
              cancellations or merchant reimbursements) are handled entirely by
              the merchant and the issuer. The user acknowledges and agrees that
              the refunded amount may take between 7 and 45 business days to be
              credited back to their card balance from the moment the merchant
              initiates the refund. The platform has no control over this
              timeframe and cannot expedite it.
            </p>
            <p>
              <strong>7.3 Offline Purchases and Temporary Holds</strong>
              <br />
              Certain types of merchants, particularly those operating offline
              or prepaid systems (such as gas stations, parking lots, hotels,
              toll booths, or terminals with delayed settlement), may initiate a
              100% hold of the estimated amount of the transaction. These
              temporary holds may remain in place for 7 to 45 days, even if the
              final amount charged is lower.
            </p>
            <p>
              Users are strongly advised not to use the card in such
              environments due to the risk of prolonged balance holds, which
              cannot be contested or released earlier.
            </p>
            <p>
              <strong>7.4 Compliance and Audit Holds</strong>
              <br />
              The user understands and agrees that upon depositing funds to the
              card, the issuer may place a temporary hold or freeze on the
              balance for reasons including but not limited to audits, fraud
              prevention, BIN verification, or internal compliance reviews.
            </p>
            <p>Such holds may be:</p>
            <ul>
              <li>Randomized or risk-based;</li>
              <li>Applied to specific users or card groups;</li>
              <li>Triggered by issuer-side operational requirements.</li>
            </ul>
            <p>
              During such audits or internal reviews, funds may remain frozen
              for up to 90 calendar days without the possibility of withdrawal,
              reversal, or dispute. The platform has no influence or access to
              these processes and bears no responsibility for delays or
              inconveniences resulting from them. The user expressly waives any
              claim against the platform for such events.
            </p>
          </div>

          {/* 8. Termination */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">8. Termination</h2>
            <p>
              The operator reserves the right to suspend or deactivate user
              access in case of suspected abuse, breach of platform use, or
              compliance risk. No justification is required for suspension.
            </p>
          </div>

          {/* 9. Amendments */}
          <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-xl font-semibold">9. Amendments</h2>
            <p>
              These Terms may be updated from time to time. Continued use of the
              platform implies acceptance of any changes.
            </p>
          </div>

          {/* 10. Compliance Responsibility */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">
              10. Compliance Responsibility
            </h2>
            <p>
              <strong>10.1</strong> Users accessing this platform from within
              the European Economic Area (EEA), United Kingdom, United States or
              any other highly regulated jurisdiction do so entirely at their
              own risk and responsibility.
            </p>
            <p>
              <strong>10.2</strong> The operator does not actively promote,
              advertise, or target its services to residents of jurisdictions
              where financial intermediation, prepaid cards, or non-KYC accounts
              are restricted or require prior regulatory authorization. Any use
              by residents of such jurisdictions is voluntary and initiated
              without solicitation or inducement by the operator.
            </p>
            <p>
              <strong>10.3</strong> The cards accessible through this platform
              may be issued under corporate programs or employee card schemes,
              subject to the internal compliance framework of the issuer. The
              operator neither controls nor participates in the KYC process, nor
              does it collect or hold identifying information. The platform does
              not and cannot verify card ownership or identity of its users.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
