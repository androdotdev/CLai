export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-zinc-500 mb-8">Last updated: May 20, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          Clai ("we", "our", or "us") operates the Clai application and Chrome extension
          (the "Service"). This page informs you of our policies regarding the collection,
          use, and disclosure of personal data when you use our Service.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Information We Collect</h2>
        <p>
          <strong>Account information:</strong> When you sign up, we collect your email
          address and a password (stored as a salted hash). You may optionally provide
          your name, headline, summary, and skills.
        </p>
        <p>
          <strong>API keys:</strong> If you provide API keys for AI providers (OpenAI,
          Anthropic, Google Gemini, OpenRouter), they are encrypted at rest and used
          solely to generate cover letters on your behalf.
        </p>
        <p>
          <strong>Cover letters:</strong> Generated cover letters and the job descriptions
          used to create them are stored in your account so you can view and manage them
          from your dashboard.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">How We Use Information</h2>
        <p>
          We use the collected data solely to provide and improve the Service:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Authenticate your account</li>
          <li>Generate cover letters using your chosen AI provider</li>
          <li>Store and retrieve your cover letter history</li>
          <li>Display provider errors so you can troubleshoot</li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Data Storage & Security</h2>
        <p>
          Your data is stored on Neon Postgres (hosted on AWS). API keys are encrypted
          using AES-256-GCM before storage. We use secure, HTTP-only cookies for session
          management. We do not share your data with third parties except as necessary
          to provide the Service (e.g., your chosen AI provider receives the job
          description and your API key to generate a letter).
        </p>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Data Retention</h2>
        <p>
          We retain your account data and cover letters until you delete your account.
          You can delete individual cover letters from your dashboard at any time.
          To delete your entire account, contact us at androkingdom1@gmail.com.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have the right to access, correct,
          or delete your personal data. To exercise these rights, contact us at
          androkingdom1@gmail.com.
        </p>

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Contact</h2>
        <p>
          For questions about this privacy policy, contact:
          androkingdom1@gmail.com
        </p>
      </div>
    </div>
  );
}
