import logo from '../assets/logo-gol.webp';

interface HeaderProps {
  progress: number | null;
}

export function Header({ progress }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-gol-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl justify-center px-4 py-3">
        <img src={logo} alt="GOL Distribuidora" width={1607} height={1175} className="h-12 w-auto sm:h-14" />
      </div>
      {progress !== null && (
        <div
          className="h-1 bg-gol-mist"
          role="progressbar"
          aria-label="Progresso do quiz"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-r-full bg-gol-orange transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </header>
  );
}
