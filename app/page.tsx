import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Real-time Results"
            description="Watch votes come in live with instant updates powered by Supabase's real-time subscriptions."
            icon="📊"
          />
          <FeatureCard
            title="Easy Sharing"
            description="Share your poll with a unique URL. No account required for voters."
            icon="🔗"
          />
          <FeatureCard
            title="Rich Analytics"
            description="Get detailed insights with vote counts, timestamps, and visual representations."
            icon="📈"
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-card border border-border hover:border-primary transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
