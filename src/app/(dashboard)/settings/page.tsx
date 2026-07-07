import { list as listSettings } from "@/features/setting/services/setting.service";
import { SettingsForm } from "@/components/settings/settings-form";
import { PageHeader } from "@/components/page-header";

export default async function SettingsPage() {
  const settings = await listSettings();

  if (settings.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="System configuration" />
        <p className="text-sm text-muted-foreground">No settings found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System configuration" />
      <SettingsForm settings={settings} />
    </div>
  );
}
