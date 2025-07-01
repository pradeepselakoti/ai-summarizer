import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rapidApikey = import.meta.env.VITE_RAPID_API_ARTICLE_KEY;

export const articleApi = createApi({
    reducerPath: 'articleApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://article-extractor-and-summarizer.p.rapidapi.com/',
        prepareHeaders: (headers) => {
            headers.set('x-rapidapi-key', rapidApikey);
            headers.set('x-rapidapi-host', 'article-extractor-and-summarizer.p.rapidapi.com');
            return headers;
        }
    }),
    endpoints: (builder) => ({
        getSummary: builder.query({
            query: (params) => `/summarize?url=${encodeURIComponent(params.articleUrl)}&length=3`,
            transformErrorResponse: (response, meta, arg) => {
                console.log('API Error:', response);
                
                // Handle different types of errors
                if (response.status === 503) {
                    return {
                        status: 503,
                        error: 'Service Temporarily Unavailable',
                        message: 'The summarization service is currently down. Please try again later.',
                        suggestion: 'You can visit the original article or try our fallback summary option.'
                    };
                } else if (response.status === 429) {
                    return {
                        status: 429,
                        error: 'Rate Limited',
                        message: 'Too many requests. Please wait before trying again.',
                        suggestion: 'Wait a few minutes before making another request.'
                    };
                } else if (response.status === 401) {
                    return {
                        status: 401,
                        error: 'Authentication Error',
                        message: 'Invalid API key or unauthorized access.',
                        suggestion: 'Check your API key configuration.'
                    };
                } else if (response.status >= 500) {
                    return {
                        status: response.status,
                        error: 'Server Error',
                        message: 'The server encountered an error while processing your request.',
                        suggestion: 'Please try again later or contact support if the issue persists.'
                    };
                } else if (response.status >= 400) {
                    return {
                        status: response.status,
                        error: 'Client Error',
                        message: 'There was an issue with your request.',
                        suggestion: 'Please check the URL and try again.'
                    };
                }
                
                return response;
            }
        })
    })
});

export const { useLazyGetSummaryQuery } = articleApi;