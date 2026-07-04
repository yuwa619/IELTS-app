import { PageHeader } from "@/components/layout/shells";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SettingsPrivacyActions } from "@/components/settings/SettingsPrivacyActions";
import { StatusPanel } from "@/components/settings/StatusPanel";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Card } from "@/components/ui/surface";
import { getGoal, getProfile, getTarget } from "@/lib/services/profile";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [profile, goal, target] = await Promise.all([getProfile(), getGoal(), getTarget()]);
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" eyebrow="Account, goal, privacy" />
      <Card className="space-y-4">
        <ProfileForm profile={profile} />
        <Alert tone="info">
          Goal: CLB {target.targetClb} · test date {goal.testDate ?? "not booked"} ·{" "}
          {goal.testLocation || "location not set"}. Re-run onboarding fields any time from your
          coach — targets stay editable.
        </Alert>
        <Alert tone="warning">
          Writing samples and speech recordings are sensitive. Consent can be revoked and
          deletion-ready storage paths are scaffolded.
        </Alert>
        <ButtonLink href="/auth/logout" variant="outline">Sign out</ButtonLink>
      </Card>
      <StatusPanel />
      <SettingsPrivacyActions />
    </div>
  );
}
