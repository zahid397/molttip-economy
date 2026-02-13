export const Footer = () => {
  return (
    <footer className="relative border-t border-glass-light py-6 px-6 text-center text-sm text-gray-400 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p>
          © 2026 MoltTip Economy
        </p>

        <div className="flex items-center gap-6">
          <span className="hover:text-neon-blue transition-colors cursor-pointer">
            Privacy
          </span>
          <span className="hover:text-neon-blue transition-colors cursor-pointer">
            Terms
          </span>
          <span className="text-gray-600">
            Built on Web3 ⚡
          </span>
        </div>
      </div>
    </footer>
  );
};
