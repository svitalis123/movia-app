import { UserButton as ClerkUserButton } from '@clerk/clerk-react';

interface UserButtonProps {
  className?: string;
  showName?: boolean;
}

/**
 * User button component using Clerk's UserButton
 * Provides user profile management and sign-out functionality
 */
export function UserButton({ className, showName = false }: UserButtonProps) {
  return (
    <div className={`flex items-center ${className || ''}`}>
      <ClerkUserButton
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
            userButtonPopoverCard:
              'shadow-lg border border-gray-200 rounded-lg',
            userButtonPopoverActionButton: 'hover:bg-gray-50 text-gray-700',
            userButtonPopoverActionButtonText: 'text-sm',
            userButtonPopoverFooter: 'hidden', // Hide Clerk branding
          },
        }}
        showName={showName}
        afterSignOutUrl="/sign-in"
      />
    </div>
  );
}

export default UserButton;
