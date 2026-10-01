import { notFound } from "next/navigation";
import { AnatomyApp } from "../components/AnatomyApp";
import { getDictionary } from "../i18n/dictionaries";
import { getLocale, isLocale } from "../i18n/config";
import { getChatGPTUser } from "../chatgpt-auth";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);
  // Identity comes from the ChatGPT auth headers; reading them is header-only and
  // safe even when no database binding is present. The client then loads progress.
  const user = await getChatGPTUser();
  return (
    <AnatomyApp
      locale={getLocale(locale)}
      dictionary={dictionary}
      user={user ? { displayName: user.displayName, email: user.email } : null}
    />
  );
}
