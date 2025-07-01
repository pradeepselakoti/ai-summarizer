import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rapidApikey = import.meta.env.VITE_RAPID_API_ARTICLE_KEY;

export const articleApi = createApi({
    reducerPath: 'articleApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://article-extractor-and-summarizer.p.rapidapi.com/',
        prepareHeaders: (headers) => {
            headers.set('x-rapidapi-key', rapidApikey); // Fixed: removed quotes
            headers.set('x-rapidapi-host', 'article-extractor-and-summarizer.p.rapidapi.com');
            return headers;
        }
    }),
    endpoints: (builder) => ({
        getSummary: builder.query({
            query: (params) => `/summarize?url=${encodeURIComponent(params.articleUrl)}&length=3` // Fixed: aticleUrl -> articleUrl
        })
    })
});

export const { useLazyGetSummaryQuery } = articleApi;