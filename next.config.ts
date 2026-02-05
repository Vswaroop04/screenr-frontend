import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

const withNextIntl = createNextIntlPlugin('./src/i8n/request.ts')
export default withNextIntl(nextConfig)
