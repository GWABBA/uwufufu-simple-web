'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MouseEvent, useState } from 'react';
import NavDropdownMenu from './NavDropDownMenu';
import Cookies from 'js-cookie';
import { TOKEN_COOKIE_NAME } from '@/services/auth.service';
import { logout } from '@/store/slices/auth.reducer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../language/LanguageSwitcher';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const Navigation = () => {
  const { t } = useTranslation();

  const appDispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString(); // Convert query params to string
  const router = useRouter();

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
      {dropdownOpen && (
        <NavDropdownMenu
          onLogout={handleLogout}
          onClose={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );

  const handleProtectedNav = (
    e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (user && user.isVerified === false) {
      e.preventDefault();
      // i18n key if you have one; fallback text included
      toast.error(
        t(
          'auth.verify-email-required',
          'Email verification required. Please verify your email first.'
        )
      );
      router.push('/profile');
      return;
    }
    // allow normal navigation if verified or not logged in
  };

  // Preserve existing params
  const redirectUrl = queryString ? `${pathname}?${queryString}` : pathname;

  const AuthPlaceholder = ({ isMobile }: { isMobile?: boolean }) => (
    <div
      className={`${
        isMobile ? 'w-10.5' : 'w-25'
      } h-10 flex justify-end items-center`}
    >
      <div
        className={`${
          isMobile ? 'w-10 h-10' : 'w-20 h-8'
        } bg-gray-100 animate-pulse rounded-lg`}
      />
    </div>
  );

  return (
    <nav className="w-full flex justify-center border-b border-uwu-gray">
      {/* desktop */}
      <div className="hidden md:flex w-full max-w-6xl mx-auto justify-between items-center">
        <Link href="/" className="py-4 cursor-pointer">
          <Image
            src="/assets/logos/uwufufu-logo-rgb.svg"
            alt="Uwufufu logo"
            width={240}
            height={48}
            priority // LCP 개선: 로고를 최우선 로드
            className="w-60 h-auto"
          />
        </Link>
        <div className="flex h-full">
          {/* UwU */}
          <Link
            href="https://uwuverse.co/"
            className="flex items-center"
            target="_blank"
          >
            <button className="bg-uwu-red py-2 px-4 text-white rounded-lg mr-6 text-sm font-bold">
              UwU
            </button>
          </Link>

          {/* plans */}
          <Link href="/plans" className="flex items-center">
            <button className="bg-uwu-red py-2 px-2 text-white rounded-lg mr-6 text-sm font-bold">
              {t('navigation.subscription')}
            </button>
          </Link>

          {/* discord */}
          <Link
            href="https://discord.gg/jFcuMQdTzC"
            target="_blank"
            className="flex items-center"
          >
            <button className="bg-[#5865F2] py-2 px-2 text-white rounded-lg mr-6 flex items-center text-sm font-bold">
              <Image
                className="mr-1"
                src="/assets/social-medias/share_discord.svg"
                alt="Twitter"
                width={18}
                height={18}
              />
              Discord
            </button>
          </Link>

          {/* create game */}
          <Link href="/create-game" className="flex items-center">
            <button
              className="bg-uwu-red py-2 px-2 text-white rounded-lg text-sm font-bold"
              onClick={(e) => handleProtectedNav(e)}
            >
              {t('navigation.create-game')}
            </button>
          </Link>
          {/* language dropdown */}
          <div className="flex items-center ml-4">
            <label htmlFor="language-switcher" className="sr-only">
              Language
            </label>
            <LanguageSwitcher />
          </div>
          {/* <div className="flex justify-end items-center cursor-pointer ml-4">
            {!isInitialized ? (
              // 로그인 버튼과 최대한 유사한 크기의 Skeleton 구성
              <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : user ? (
              <ProfileDropdown />
            ) : (
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
                passHref
              >
                <button className="bg-uwu-red px-4 rounded-lg cursor-pointer text-white h-8 whitespace-nowrap">
                  {t('navigation.log-in')}
                </button>
              </Link>
            )}
          </div> */}
          <div className="flex justify-end items-center ml-4 min-w-30">
            {!isInitialized ? (
              <AuthPlaceholder />
            ) : user ? (
              <ProfileDropdown />
            ) : (
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
                passHref
              >
                <button className="bg-uwu-red px-4 rounded-lg cursor-pointer text-white h-9 whitespace-nowrap font-bold">
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
