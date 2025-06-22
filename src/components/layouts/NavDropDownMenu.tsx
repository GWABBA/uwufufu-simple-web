'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface NavDropdownMenuProps {
  onLogout: () => void;
  onClose: () => void;
}

const NavDropdownMenu: React.FC<NavDropdownMenuProps> = ({
  onLogout,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute right-0 mt-2 md:mt-3 w-48 border border-uwu-gray bg-uwu-black rounded-md shadow-lg z-50">
      <ul>
        <li className="md:hidden">
          <Link
            href="https://uwuverse.co/"
            onClick={onClose}
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
            target="_blank"
          >
            UwU
          </Link>
        </li>
        <li className="md:hidden">
          <Link
            href="/plans"
            onClick={onClose}
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.subscription')}
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            onClick={onClose}
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.profile')}
          </Link>
        </li>
        <li>
          <Link
            href="/my/plays"
            onClick={onClose}
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.play-history')}
          </Link>
        </li>
        <li className="md:hidden">
          <Link
            href="/create-game"
            onClick={onClose}
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.create-game')}
          </Link>
        </li>
        <li>
          <Link
            href="/my/games"
            onClick={onClose}
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.my-games')}
          </Link>
        </li>
        <li>
          <Link
            href="https://discord.gg/jFcuMQdTzC"
            onClick={onClose}
            target="_blank"
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.join-discord')}
          </Link>
        </li>
        <li>
          <button
            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
            onClick={onLogout}
          >
            {t('navigation.log-out')}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default NavDropdownMenu;
