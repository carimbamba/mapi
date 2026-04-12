/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilita static generation para páginas que usam Supabase server
  output: "standalone",
};

module.exports = nextConfig;
