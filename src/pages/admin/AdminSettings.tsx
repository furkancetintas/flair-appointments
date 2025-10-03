import { useAuth } from "@/hooks/useAuth";
import BarberProfileForm from "@/components/BarberProfileForm";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold">Profil Ayarları</h2>
      </div>
      
      {profile?.id && <BarberProfileForm profileId={profile.id} />}
    </div>
  );
}
