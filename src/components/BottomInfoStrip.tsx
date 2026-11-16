import { Activity, Layers, ShieldCheck } from 'lucide-react';

export function BottomInfoStrip() {
  const pillars = [
    {
      title: 'Smart Sensing',
      description: 'Real-time movement and environmental monitoring.',
      Icon: Activity,
    },
    {
      title: 'Modular Design',
      description: 'Replaceable and upgradeable components.',
      Icon: Layers,
    },
    {
      title: 'Smart Comfort',
      description: 'Socket pressure and environmental monitoring.',
      Icon: ShieldCheck,
    },
  ];

  return (
    <section
      aria-label="Core prosthetic engineering pillars"
      className="relative z-20 border-t border-white/[0.07] bg-[#0B0D10]/95 px-4 py-3.5 sm:px-8 lg:px-10"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {pillars.map(({ title, description, Icon }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#141820] text-teal-400">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xs font-semibold tracking-wide text-[#F3F5F8] uppercase">
                {title}
              </h2>
              <p className="mt-0.5 text-xs leading-snug text-[#8E98A8]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
