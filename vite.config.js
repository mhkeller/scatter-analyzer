import { sveltekit } from '@sveltejs/kit/vite';
import dsv from '@rollup/plugin-dsv';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [dsv(), sveltekit()]
};

export default config;
