import { CreateTeamForm } from '@/components/team/CreateTeamForm';

export default function NewTeamPage() {
  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/tlv-background.webp')" }}
      />
      <div className="relative z-10 px-4 py-8 md:py-16 max-w-2xl mx-auto">
        <CreateTeamForm />
      </div>
    </div>
  );
}
