'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import NavDropdownMenu from './NavDropDownMenu';
import Cookies from 'js-cookie';
import { TOKEN_COOKIE_NAME } from '@/services/auth.service';
import { logout } from '@/store/slices/auth.reducer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../language/LanguageSwitcher';

const Navigation = () => {
  const { t } = useTranslation();

  const appDispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString(); // Convert query params to string

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setDropdownOpen(false); // Close dropdown on logout
    Cookies.remove(TOKEN_COOKIE_NAME);
    appDispatch(logout());
  };

  const ProfileDropdown = () => (
    <div className="relative cursor-pointer">
      <div
        className="flex items-center rounded-full cursor-pointer"
        onClick={toggleDropdown}
      >
        {user && user.profileImage ? (
          <Image
            src={user.profileImage}
            alt="profile"
            className="cursor-pointer rounded-full"
            width={42}
            height={42}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/assets/icons/account-circle.svg';
            }}
          />
        ) : (
          <Image
            src="/assets/icons/account-circle.svg"
            alt="profile"
            className="cursor-pointer rounded-full"
            width={42}
            height={42}
          />
        )}
      </div>
      {dropdownOpen && <NavDropdownMenu onLogout={handleLogout} />}
    </div>
  );

  // Preserve existing params
  const redirectUrl = queryString ? `${pathname}?${queryString}` : pathname;

  return (
    <nav className="w-full flex justify-center border-b border-uwu-gray">
      {/* desktop */}
      <div className="hidden md:flex w-full max-w-6xl mx-auto justify-between items-center">
        <Link href="/" className="py-4 cursor-pointer">
          <Image
            src="/assets/logos/uwufufu-logo-rgb.svg"
            alt="Uwufufu logo"
            width={100}
            height={50}
            className="w-60"
          />
        </Link>
        <div className="flex h-full">
          {/* UwU */}
          <Link href="/uwu" className="flex items-center">
            <button className="bg-uwu-red py-2 px-2 text-white rounded-lg mr-4">
              UwU
            </button>
          </Link>

          {/* plans */}
          <Link href="/plans" className="flex items-center">
            <button className="bg-uwu-red py-2 px-2 text-white rounded-lg mr-4">
              {t('navigation.subscription')}
            </button>
          </Link>

          {/* discord */}
          <Link
            href="https://discord.gg/jFcuMQdTzC"
            target="_blank"
            className="flex items-center"
          >
            <button className="bg-[#5865F2] py-2 px-2 text-white rounded-lg mr-4 flex items-center">
              <Image
                className="mr-2"
                src="/assets/social-medias/share_discord.svg"
                alt="Twitter"
                width={24}
                height={24}
              />
              Discord
            </button>
          </Link>

          {/* create game */}
          <Link href="/create-game" className="flex items-center">
            <button className="bg-uwu-red py-2 px-2 text-white rounded-lg">
              {t('navigation.create-game')}
            </button>
          </Link>
          {/* language dropdown */}
          <div className="flex items-center ml-4">
            <LanguageSwitcher />
          </div>
          <div className="flex justify-end items-center cursor-pointer ml-4">
            {!isInitialized ? (
              <div className="w-12 h-8 rounded-md"></div> // Show loading state
            ) : user ? (
              <ProfileDropdown />
            ) : (
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
                passHref
              >
                <button className="bg-uwu-red px-4 rounded-lg cursor-pointer text-white h-8">
                  {t('navigation.log-in')}
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden w-full max-w-6xl mx-auto justify-between items-center px-2">
        <Link href="/" className="py-4">
          <Image
            src="/assets/logos/uwufufu-logo-rgb.svg"
            alt="Uwufufu logo"
            width={100}
            height={50}
            className="w-40"
          />
        </Link>
        <div>
          {!isInitialized ? (
            <div className="w-12 h-8 rounded-md"></div> // Show loading state
          ) : user ? (
            <ProfileDropdown />
          ) : (
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
              passHref
            >
              <button className="bg-uwu-red px-4 rounded-lg cursor-pointer text-white h-8">
                {t('navigation.log-in')}
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
