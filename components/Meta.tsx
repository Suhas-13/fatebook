import { DefaultSeo } from "next-seo"

export default function Meta() {
  return (
    <DefaultSeo
      titleTemplate="%s - Fatebook"
      defaultTitle="Fatebook"
      description="Track your predictions, make better decisions."
      canonical="https://fatebook.io/"
      openGraph={{
        type: "website",
        locale: "en_US",
        url: "https://fatebook.io/",
        title: "Fatebook",
        description:
          "Track your predictions, make better decisions.",
        site_name: "Fatebook",
        images: [
          {
            url: "https://fatebook.io/mclean.png",
            width: 800,
            height: 533,
          },
        ],
      }}
      additionalLinkTags={[
        {
          rel: "icon",
          href: "https://fatebook.io/scale.svg",
        },
      ]}
    />
  )
}