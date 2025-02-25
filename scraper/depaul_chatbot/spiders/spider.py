import scrapy
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin
import json
from pathlib import Path
import time

class DePaulSpider(scrapy.Spider):
    name = 'depaul'
    allowed_domains = ['depaul.edu']
    start_urls = ['https://www.depaul.edu/sitemap.xml']
    custom_settings = {
        'ROBOTSTXT_OBEY': True,
        'CONCURRENT_REQUESTS': 16,
        'DOWNLOAD_DELAY': 1,
        'COOKIES_ENABLED': False,
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    def __init__(self, *args, **kwargs):
        super(DePaulSpider, self).__init__(*args, **kwargs)
        self.data_dir = Path(__file__).resolve().parent.parent / 'data'
        self.data_dir.mkdir(exist_ok=True)
        print(f"Data directory created at: {self.data_dir}")
        self.processed_urls = set()
        self.all_scraped_urls = []  # New attribute to store all scraped URLs

    def parse(self, response):
        # Parse sitemap XML
        urls = response.xpath('//xmlns:loc/text()', namespaces={'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}).getall()
        
        for url in urls:
            if url.endswith('.aspx') and url not in self.processed_urls:
                self.processed_urls.add(url)
                yield scrapy.Request(url, callback=self.parse_page)

    def parse_page(self, response):
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Remove script tags and their contents
        for script in soup.find_all('script'):
            script.decompose()
            
        # Remove style tags and their contents
        for style in soup.find_all('style'):
            style.decompose()

        # Find main content
        main_content = soup.find('main') or soup.find(id=re.compile('^(main|content)')) or soup.find(class_=re.compile('^(main|content)'))
        
        if not main_content:
            return

        # Extract text content
        text_content = ' '.join([p.get_text(strip=True) for p in main_content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'])])
        
        # Clean text content
        text_content = re.sub(r'\s+', ' ', text_content).strip()
        
        if text_content:
            data = {
                'url': response.url,
                'title': soup.title.string if soup.title else '',
                'content': text_content
            }
            self.all_scraped_urls.append(response.url)  # Append the current URL to the list
            # Save to JSON file
            timestamp = int(time.time())  # Get current timestamp
            filename = f"page_{timestamp}_{len(self.all_scraped_urls)}.json"  # Include timestamp in filename
            with open(self.data_dir / filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            yield data
