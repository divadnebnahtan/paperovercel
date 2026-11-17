# Papero Vercel

A Vercel function that returns procedurally generated PNGs. Install dependencies with `npm ci`, then run using Vercel's Node function runtime. The native `canvas` dependency needs a compatible prebuilt binary or its platform build prerequisites.

Request `/api/image?w=828&h=1792&nf=3`. The handler in `api/image.js` parses the query and streams the response; `lib/generate-image.js` owns canvas allocation and spiral colour diffusion. Missing or zero values use the existing defaults. Use modest positive dimensions because generation allocates memory and runs synchronously. Images are streamed rather than saved to the repository.
