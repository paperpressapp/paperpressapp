'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Privacy Policy</h1>
      </div>
      <div className="px-4 py-6 space-y-6">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We collect information you provide during registration, including your name, email address, 
            educational institution, and role (student or teacher). We also collect information about 
            your usage of the application, such as papers created and settings preferences.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use your information to provide and improve the PaperPress service, personalize your 
            experience, communicate with you about updates, and ensure the security of your account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. Data Storage</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your account information is stored securely in our database. Generated papers are stored 
            locally on your device unless you choose to save them to your account. We use industry-standard 
            security measures to protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Data Sharing</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We do not sell or share your personal information with third parties except as required 
            by law or to protect our rights. Question banks and educational content are pre-loaded 
            and do not contain any personal information.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">5. Your Rights</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            You have the right to access, correct, or delete your personal information. You can 
            update your profile information in the Settings page. To delete your account and all 
            associated data, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">6. Cookies and Local Storage</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use local storage to save your preferences and session information. This allows 
            you to use the application offline and maintain your settings across sessions. You 
            can clear this data through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">7. Children&apos;s Privacy</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            PaperPress is intended for educational use by students and teachers. We comply with 
            applicable laws regarding children&apos;s privacy. If you are under 13, please use the 
            application under parental or teacher supervision.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">8. Changes to Privacy Policy</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant 
            changes through the application or via email.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">9. Contact Us</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please 
            contact us at privacy@paperpress.pk
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4">
          Last updated: February 2026
        </p>
      </div>
    </AppLayout>
  );
}
