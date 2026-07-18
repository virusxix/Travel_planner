import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

/**
 * Shared top navigation.
 * - `action`: single always-visible button (e.g. Back) — never collapses.
 * - `links` + `user`/`showLogout`: collapse into a hamburger menu on mobile.
 */
export default function Navbar({ logo = 'HiddenStay', logoTo, links = [], user, showLogout = false, action }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (item) => {
    setOpen(false);
    if (item.onClick) item.onClick();
    else if (item.to) navigate(item.to);
  };

  const logout = () => {
    localStorage.removeItem('hiddenstay_user');
    window.location.href = '/';
  };

  const hasMenu = links.length > 0 || showLogout;
  const linkClass =
    'px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors';

  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-white/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => logoTo && navigate(logoTo)}
          className="font-display text-xl font-semibold tracking-tight text-foreground"
        >
          {logo}
        </button>

        <div className="flex items-center gap-1">
          {/* Always-visible single action (e.g. Back) */}
          {action && (
            <button type="button" data-testid={action.testId} onClick={() => go(action)} className={linkClass}>
              {action.label}
            </button>
          )}

          {/* Desktop menu */}
          {hasMenu && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <button key={l.label} type="button" data-testid={l.testId} onClick={() => go(l)} className={linkClass}>
                  {l.label}
                </button>
              ))}
              {user && <span className="ml-2 text-sm text-muted-foreground">{user.name}</span>}
              {showLogout && (
                <button type="button" onClick={logout} className={linkClass}>
                  Logout
                </button>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          {hasMenu && (
            <button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              data-testid="mobile-menu-button"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile panel */}
      {hasMenu && open && (
        <div className="md:hidden border-t border-border/70 bg-white/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {user && <span className="px-3 py-2 text-sm text-muted-foreground">Signed in as {user.name}</span>}
            {links.map((l) => (
              <button
                key={l.label}
                type="button"
                onClick={() => go(l)}
                className="text-left px-3 py-2.5 text-sm font-medium text-foreground rounded-md hover:bg-muted"
              >
                {l.label}
              </button>
            ))}
            {showLogout && (
              <button
                type="button"
                onClick={logout}
                className="text-left px-3 py-2.5 text-sm font-medium text-primary rounded-md hover:bg-muted"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
