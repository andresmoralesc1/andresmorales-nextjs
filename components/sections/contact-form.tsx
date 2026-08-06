import { getCurrentDictionary } from '@/lib/dictionary';
import { ContactFormClient } from '@/components/sections/contact-form.client';

// Server wrapper around the client `ContactFormClient`. Resolves the
// dictionary server-side so the form labels and help text translate
// based on the URL locale prefix.
export async function ContactForm() {
  const d = await getCurrentDictionary();
  return (
    <ContactFormClient
      nameLabel={d.contact.formNameLabel}
      emailLabel={d.contact.formEmailLabel}
      messageLabel={d.contact.formMessageLabel}
      messagePlaceholder={d.contact.formMessagePlaceholder}
      messageHelp={d.contact.formMessageHelp}
      dict={{
        honeypotLabel: d.contactForm.honeypotLabel,
        submit: d.contactForm.submit,
        submitting: d.contactForm.submitting,
        successTitle: d.contactForm.successTitle,
        successBody: d.contactForm.successBody,
        successRetry: d.contactForm.successRetry,
        errorPrefix: d.contactForm.errorPrefix,
        errorFallback: d.contactForm.errorFallback,
        errorSuffix: d.contactForm.errorSuffix,
      }}
    />
  );
}
