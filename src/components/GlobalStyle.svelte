<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    .btn-wetlands {
	    @apply bg-green-700 hover:bg-green-800 text-white font-semibold py-1.5 px-4 rounded m-2
    }

    .btn-wetlands:disabled {
	    @apply bg-gray-400 hover:bg-gray-400 text-gray-200 cursor-default
    }
</style>