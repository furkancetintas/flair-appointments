import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const SITE_NAME = 'Ömrüm Erkek Kuaförü';
const BASE_URL = 'https://omrum-kuafor.lovable.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export const SEO = ({
  title,
  description = 'Ömrüm Erkek Kuaför\'de online randevu alın, beklemeden traş olun. Profesyonel erkek kuaförü hizmetleri, hızlı ve kolay randevu sistemi.',
  keywords = 'erkek kuaförü, berber, online randevu, saç kesimi, sakal tıraşı, erkek bakım, kuaför randevu',
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noindex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Online Randevu`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:locale" content="tr_TR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="language" content="Turkish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
    </Helmet>
  );
};

export default SEO;
