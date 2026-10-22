import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function HomeSectionLink({
  children,
  sectionId,
  onClick,
  ...props
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const to = `/#${sectionId}`;

  const handleClick = useCallback(
    (event) => {
      onClick?.(event);
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (location.pathname !== '/') return;

      event.preventDefault();
      navigate(to);
      window.requestAnimationFrame(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: 'smooth' });
      });
    },
    [location.pathname, navigate, onClick, sectionId, to]
  );

  return (
    <Link {...props} onClick={handleClick} to={to}>
      {children}
    </Link>
  );
}
