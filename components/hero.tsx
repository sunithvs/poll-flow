import Link from 'next/link';

export default function Header() {
  return (
    <div className="flex flex-col gap-8 items-center py-16 bg-gradient-to-b from-background to-muted">
      <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
        PollFlow
      </h1>
      <p className="text-xl md:text-2xl text-center text-muted-foreground max-w-2xl mx-auto px-4">
        Create and share real-time polls instantly. Get immediate feedback with live results and beautiful visualizations.
      </p>
      <div className="flex gap-4 mt-8">
        <Link
          href="/create"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Create Poll
        </Link>

      </div>
      <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-border to-transparent my-8" />
    </div>
  );
}
