'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface NavDropdownMenuProps {
  onLogout: () => void;
}

const NavDropdownMenu: React.FC<NavDropdownMenuProps> = ({ onLogout }) => {
  const { t } = useTranslation();

  return (
    <div className="absolute right-0 mt-2 md:mt-3 w-48 border border-uwu-gray bg-uwu-black rounded-md shadow-lg z-50">
      <ul>
        <li className="md:hidden">
          <Link
            href="/plans"
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.subscription')}
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.profile')}
          </Link>
        </li>
        <li className="md:hidden">
          <Link
            href="/create-game"
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.create-game')}
          </Link>
        </li>
        <li>
          <Link
            href="/my/games"
            className="block px-4 py-2 text-white hover:bg-gray-100 hover:text-gray-800"
          >
            {t('navigation.my-games')}
          </Link>
        </li>
        <li>
          <Link
            href="https://discord.gg/jFcuMQdTzC"
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
