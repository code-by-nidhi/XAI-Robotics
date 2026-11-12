import { Card } from '../../components/common/Card'
import { PageHeader } from '../../components/layout/PageHeader'
import { MediaBrowser } from './MediaBrowser'

export default function MediaLibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Images reused across blogs, pages and the rest of the site"
      />

      <Card flush className="flex flex-col">
        <MediaBrowser mode="library" />
      </Card>
    </div>
  )
}
