import type { NextConfig } from 'next';
import type { Configuration, RuleSetRule } from 'webpack';

function isRuleSetRule(rule: unknown): rule is RuleSetRule {
  return typeof rule === 'object' && rule !== null && 'test' in rule;
}

function addSvgExclude(rule: RuleSetRule) {
  if (!rule.exclude) {
    rule.exclude = /\.svg$/i;
  } else if (Array.isArray(rule.exclude)) {
    rule.exclude.push(/\.svg$/i);
  } else {
    rule.exclude = [rule.exclude, /\.svg$/i];
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.uwufufu.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },

  async rewrites() {
    const apiHost = process.env.API_HOST ?? 'http://localhost:8080';

    return [
      {
        source: '/v1/:path*',
        destination: `${apiHost}/v1/:path*`,
      },
    ];
  },

  webpack(config: Configuration) {
    if (!config.module?.rules) return config;

    for (const rule of config.module.rules) {
      if (
        isRuleSetRule(rule) &&
        rule.test instanceof RegExp &&
        rule.test.test('file.svg')
      ) {
        addSvgExclude(rule);
      }
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
