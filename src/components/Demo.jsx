import { useState, useEffect } from 'react';
import { copy, linkIcon, loader, tick } from '../assets';
import { useLazyGetSummaryQuery } from '../services/article';

const Demo = () => {
  const [article, setArticle] = useState({
    url: '',
    summary: '',
  });
  
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState('');

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem('articles')
    );
    
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const existingArticle = allArticles.find(
      (item) => item.url === article.url
    );

    if (existingArticle) return setArticle(existingArticle);

    try {
      const { data } = await getSummary({ articleUrl: article.url });
      
      if (data?.summary) {
        const newArticle = { ...article, summary: data.summary };
        const updatedAllArticles = [newArticle, ...allArticles];

        setArticle(newArticle);
        setAllArticles(updatedAllArticles);
        localStorage.setItem('articles', JSON.stringify(updatedAllArticles));
      }
    } catch (err) {
      console.error('Summary generation failed:', err);
    }
  };

  // Handle copying to clipboard
  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  // Generate fallback summary when API fails
  const generateFallbackSummary = () => {
    if (!article.url) return;
    
    const fallbackSummary = `This is a fallback summary for the article at ${article.url}. The original summarization service is currently unavailable. To get the actual content, please visit the link directly. This tool normally provides AI-powered summaries of web articles, but we're experiencing temporary service issues.`;
    
    const newArticle = { ...article, summary: fallbackSummary };
    const updatedAllArticles = [newArticle, ...allArticles];
    
    setArticle(newArticle);
    setAllArticles(updatedAllArticles);
    localStorage.setItem('articles', JSON.stringify(updatedAllArticles));
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  return (
    <section className='mt-16 w-full max-w-xl'>
      {/* Search */}
      <div className='flex flex-col w-full gap-2'>
        <form
          className='relative flex justify-center items-center'
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link_icon"
            className='absolute left-0 my-2 ml-3 w-5'
          />

          <input
            type='url'
            placeholder='Paste the article link'
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            onKeyDown={handleKeyDown}
            required
            className='url_input peer'
          />

          <button
            type='submit'
            className='submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700'
            disabled={isFetching}
          >
            {isFetching ? (
              <img src={loader} alt="loading" className='w-4 h-4 animate-spin' />
            ) : (
              '↵'
            )}
          </button>
        </form>

        {/* Browse History */}
        <div className='flex flex-col gap-1 max-h-60 overflow-y-auto'>
          {allArticles.reverse().map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => setArticle(item)}
              className='link_card'
            >
              <div className='copy_btn' onClick={() => handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy}
                  alt={copied === item.url ? "tick_icon" : "copy_icon"}
                  className='w-[40%] h-[40%] object-contain'
                />
              </div>
              <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                {item.url}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Display Result */}
      <div className='my-10 max-w-full flex justify-center items-center'>
        {isFetching ? (
          <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
        ) : error ? (
          <div className='flex flex-col items-center gap-4'>
            <p className='font-inter font-bold text-black text-center'>
              Service Temporarily Unavailable
              <br />
              <span className='font-satoshi font-normal text-gray-700'>
                The summarization service is currently down (503 error).
              </span>
            </p>
            
            {article.url && (
              <div className='flex flex-col gap-2'>
                <button
                  onClick={generateFallbackSummary}
                  className='black_btn'
                >
                  Generate Fallback Summary
                </button>
                <a
                  href={article.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='blue_gradient text-center underline'
                >
                  Visit Original Article
                </a>
              </div>
            )}
            
            <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <h4 className='font-bold text-red-800 mb-2'>Troubleshooting Tips:</h4>
              <ul className='text-sm text-red-700 space-y-1'>
                <li>• The API service may be down temporarily</li>
                <li>• Try again in a few minutes</li>
                <li>• Check if the URL is accessible</li>
                <li>• Ensure you have a stable internet connection</li>
              </ul>
            </div>
          </div>
        ) : (
          article.summary && (
            <div className='flex flex-col gap-3'>
              <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                Article <span className='blue_gradient'>Summary</span>
              </h2>
              <div className='summary_box'>
                <p className='font-inter font-medium text-sm text-gray-700'>
                  {article.summary}
                </p>
              </div>
              
              {/* Copy summary button */}
              <div className='flex justify-end'>
                <div
                  className='copy_btn'
                  onClick={() => handleCopy(article.summary)}
                >
                  <img
                    src={copied === article.summary ? tick : copy}
                    alt={copied === article.summary ? "tick_icon" : "copy_icon"}
                    className='w-[40%] h-[40%] object-contain'
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;