/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['pdf-parse', '@react-pdf/renderer', '@xenova/transformers'],
	},
	typescript: {
		// Type errors should always fail the build.
		ignoreBuildErrors: false,
	},
	eslint: {
		// Don't let a stylistic lint warning block a production deploy.
		// Type-checking still fails the build (above).
		ignoreDuringBuilds: true,
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
				crypto: false,
				'onnxruntime-node': false,
			};
		}

		config.resolve.alias = {
			...config.resolve.alias,
			canvas: false,
			sharp: false,
		};

		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			layers: true,
		};

		return config;
	},
};

export default nextConfig;
