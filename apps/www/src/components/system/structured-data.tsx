import Script from "next/script";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Rover",
    applicationCategory: "DeveloperApplication",
    description:
      "AI-powered coding assistant platform that allows you to run coding agents in parallel inside remote sandboxes",
    url: "https://www.roverlabs.com",
    creator: {
      "@type": "Organization",
      name: "Rover Labs",
      url: "https://www.roverlabs.com",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    operatingSystem: "Web",
    featureList: [
      "Parallel coding agents",
      "Remote sandboxes",
      "Claude Code integration",
      "Automated testing",
      "Git integration",
      "Real-time collaboration",
    ],
    softwareRequirements: "Modern web browser with JavaScript enabled",
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Rover Labs",
    url: "https://www.roverlabs.com",
    logo: "https://www.roverlabs.com/favicon.png",
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rover",
    url: "https://www.roverlabs.com",
  };

  return (
    <>
      <Script
        id="structured-data-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <Script
        id="structured-data-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData),
        }}
      />
    </>
  );
}
