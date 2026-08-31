type PasswordVisibilityIconProps = {
  visible: boolean;
};

export function PasswordVisibilityIcon({ visible }: PasswordVisibilityIconProps) {
  if (visible) {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path d="M3 3l18 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        <path d="M10.6 10.7a2 2 0 002.7 2.7M9.9 5.2A10.7 10.7 0 0112 5c5.3 0 8.7 5.2 8.7 5.2a12.6 12.6 0 01-2.2 2.8M6.4 6.5a14.6 14.6 0 00-3.1 3.7S6.7 15.4 12 15.4c1 0 2-.2 2.8-.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M3.3 12S6.7 6.8 12 6.8 20.7 12 20.7 12 17.3 17.2 12 17.2 3.3 12 3.3 12z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
