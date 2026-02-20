'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
        <h1 className="text-lg font-semibold text-gray-900">Terms of Service</h1>
      </div>
      <div className="px-4 py-6 space-y-6">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            By accessing and using PaperPress, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the application.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. Description of Service</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            PaperPress is a test paper generator application designed for Pakistani students and teachers. 
            The service allows users to select questions from pre-built question banks and generate 
            PDF exam papers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. User Accounts</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials. 
            You agree to provide accurate and complete information during registration and to update 
            your information to keep it accurate and current.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Educational Use</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            PaperPress is intended for educational purposes only. The question banks are based on 
            Pakistani curriculum standards and are meant to assist in exam preparation and teaching.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">5. Intellectual Property</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            All content generated through PaperPress, including test papers, is for your personal 
            or institutional use. You may not sell or redistribute generated content commercially 
            without permission.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">6. Limitation of Liability</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            PaperPress is provided as-is without warranties of any kind. We are not responsible 
            for any errors in the question bank or for exam outcomes resulting from the use of 
            generated papers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">7. Changes to Terms</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We reserve the right to modify these terms at any time. Continued use of the service 
            after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">8. Contact</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            For questions about these Terms of Service, please contact us at support@paperpress.pk
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4">
          Last updated: February 2026
        </p>
      </div>
    </AppLayout>
  );
}
