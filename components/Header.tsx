interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-transparent pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:border-none sm:pb-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base leading-snug">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center sm:pt-1">
        <span className="text-xs font-semibold text-gray-900 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 sm:text-sm">
          Admin
        </span>
      </div>
    </header>
  );
}
