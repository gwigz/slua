import { Hero } from "~/components/landing/hero"
import { CodeGallery } from "~/components/landing/code-gallery"
import { Features } from "~/components/landing/features"
import { Resources } from "~/components/landing/resources"
import { CodeGalleryPreview } from "~/components/landing/code-preview"

export default async function HomePage() {
  const galleryTabs = await CodeGalleryPreview()

  return (
    <>
      <Hero />
      <CodeGallery tabs={galleryTabs} />
      <Features />
      <Resources />
    </>
  )
}
