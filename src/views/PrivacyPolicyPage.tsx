import LegalLayout from "@/components/legal/LegalLayout";

const PrivacyPolicyPage = () => (
  <LegalLayout title="Privacy Policy">
    <p>
      This Privacy Policy explains how Wild Baddies ("we", "us", "our") collects,
      uses, and protects information when you use our website. By using the site
      you agree to the practices described below.
    </p>

    <h2>Information We Collect</h2>
    <ul>
      <li>Technical data: IP address, browser type, device, operating system, referring URL.</li>
      <li>Usage data: pages viewed, videos played, search terms, time on site.</li>
      <li>Cookies and similar technologies for session management, preferences, and analytics.</li>
      <li>Information you voluntarily provide (e.g. when uploading content or contacting us).</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <ul>
      <li>Operate, maintain, and improve the website and its features.</li>
      <li>Stream and deliver video content efficiently via our CDN.</li>
      <li>Detect, prevent, and respond to fraud, abuse, or security incidents.</li>
      <li>Comply with legal obligations and respond to lawful requests.</li>
    </ul>

    <h2>Third-Party Services</h2>
    <p>
      We rely on trusted service providers to operate the platform, including a
      content delivery network for video streaming and a cloud backend for
      database, authentication, and storage. These providers process data only
      as needed to deliver their services.
    </p>

    <h2>Cookies</h2>
    <p>
      We use cookies and local storage for essential functionality (such as the
      18+ age verification gate), preferences, and aggregated analytics. You can
      disable cookies in your browser, but some parts of the site may not work.
    </p>

    <h2>Your Rights</h2>
    <p>
      Depending on your jurisdiction (including under GDPR and CCPA), you may
      have the right to access, correct, delete, or restrict processing of your
      personal data, and to object to certain uses. To exercise these rights,
      contact us using the details below.
    </p>

    <h2>Data Retention</h2>
    <p>
      We retain personal data only for as long as needed to fulfil the purposes
      described in this policy, comply with our legal obligations, resolve
      disputes, and enforce our agreements.
    </p>

    <h2>Children</h2>
    <p>
      The website is strictly for adults aged 18 or older (or the age of
      majority in your jurisdiction, whichever is higher). We do not knowingly
      collect data from minors.
    </p>

    <h2>Changes to this Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. Material changes will
      be reflected by updating the date below.
    </p>

    <h2>Contact</h2>
    <p>
      Questions or requests regarding this policy can be sent to{" "}
      <a href="mailto:privacy@wildbaddies.com">privacy@wildbaddies.com</a>.
    </p>

    <p className="text-xs">Last updated: {new Date().getFullYear()}</p>
  </LegalLayout>
);

export default PrivacyPolicyPage;