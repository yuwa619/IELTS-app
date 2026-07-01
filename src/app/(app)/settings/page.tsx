import { PageHeader } from "@/components/layout/shells";
import { SettingsPrivacyActions } from "@/components/settings/SettingsPrivacyActions";
import { ButtonLink } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { Alert, Card } from "@/components/ui/surface";
import { getProfile } from "@/lib/services/profile";

export default async function SettingsPage() {
  const profile = await getProfile();
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" eyebrow="Account, goal, privacy" />
      <Card className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input defaultValue={profile.displayName ?? ""} />
        </div>
        <div>
          <Label>Daily study time</Label>
          <Select defaultValue={profile.dailyMinutes}>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
          </Select>
        </div>
        <Alert tone="warning">Writing samples and speech recordings are sensitive. Consent can be revoked and deletion-ready storage paths are scaffolded.</Alert>
        <ButtonLink href="/auth/logout" variant="outline">Sign out</ButtonLink>
      </Card>
      <SettingsPrivacyActions />
    </div>
  );
}
