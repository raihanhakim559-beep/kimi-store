type ActivationEmailParams = {
  name?: string | null;
  onboardingUrl: string;
};

const baseStyles = {
  body: `margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background-color:#f5f5f5;color:#111;`,
  container: `max-width:560px;margin:0 auto;padding:32px;background-color:#ffffff;`,
  title: `font-size:24px;font-weight:600;margin-bottom:12px;`,
  text: `font-size:15px;line-height:1.6;margin:12px 0;`,
  buttonWrapper: `margin:24px 0;`,
  button: `display:inline-block;padding:14px 22px;border-radius:999px;background:#111111;color:#ffffff;text-decoration:none;font-weight:600;`,
  footer: `font-size:12px;color:#666;margin-top:32px;`,
};

export const buildActivationEmail = ({
  name,
  onboardingUrl,
}: ActivationEmailParams) => {
  const greeting = name ? `Hey ${name.split(" ")[0]},` : "Hey there,";

  const html = `<!doctype html><html><body style="${baseStyles.body}">
    <div style="padding:32px 16px;">
      <div style="${baseStyles.container}">
        <h1 style="${baseStyles.title}">Activate your Kimi Store account</h1>
        <p style="${baseStyles.text}">${greeting}</p>
        <p style="${baseStyles.text}">Thanks for creating an account with Kimi Store Shoes. We just need a few details (shipping info, phone, and agreement) to activate your profile.</p>
        <div style="${baseStyles.buttonWrapper}">
          <a href="${onboardingUrl}" style="${baseStyles.button}">Complete onboarding</a>
        </div>
        <p style="${baseStyles.text}">If the button doesn\'t work, copy and paste this link into your browser:<br/><span>${onboardingUrl}</span></p>
        <p style="${baseStyles.text}">This link expires in 24 hours. If it expires, you can request another activation email from the checkout page.</p>
        <p style="${baseStyles.footer}">© ${new Date().getFullYear()} Kimi Store Shoes</p>
      </div>
    </div>
  </body></html>`;

  const text = `${greeting}\n\nThanks for creating an account with Kimi Store Shoes. Complete onboarding here: ${onboardingUrl}\n\nThe link expires in 24 hours.`;

  return { html, text, subject: "Activate your Kimi Store account" };
};
