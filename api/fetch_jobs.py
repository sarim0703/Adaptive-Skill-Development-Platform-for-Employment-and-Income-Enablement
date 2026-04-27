from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import warnings
from jobspy import scrape_jobs
import pandas as pd

warnings.filterwarnings("ignore")

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query_components = parse_qs(urlparse(self.path).query)
        search_term = query_components.get("q", ["Retail Sales Associate"])[0]
        location = query_components.get("l", ["India"])[0]
        city = query_components.get("c", [""])[0]
        
        # Robust Smart City Correction
        city_map = {
            "bengaluru": "Bangalore",
            "mumbai": "Mumbai",
            "gurugram": "Gurgaon",
            "delhi": "Delhi",
            "hyderabad": "Hyderabad",
            "chennai": "Chennai",
            "pune": "Pune",
        }
        
        clean_city = city.lower().strip()
        if clean_city in city_map:
            clean_city = city_map[clean_city]
        
        search_location = f"{clean_city}, {location}" if clean_city else location
        glassdoor_location = clean_city if clean_city else location

        job_list = []
        try:
            # Scrape Indeed & LinkedIn
            jobs_df = scrape_jobs(
                site_name=["indeed", "linkedin"],
                search_term=search_term,
                location=search_location,
                results_wanted=15,
                hours_old=168,
                country_indeed="india",
                verbose=0
            )
            
            # Scrape Glassdoor separately
            try:
                gd_df = scrape_jobs(
                    site_name=["glassdoor"],
                    search_term=search_term,
                    location=glassdoor_location,
                    results_wanted=5,
                    hours_old=168,
                    verbose=0
                )
                if gd_df is not None and not gd_df.empty:
                    if jobs_df is not None and not jobs_df.empty:
                        jobs_df = pd.concat([jobs_df, gd_df], ignore_index=True)
                    else:
                        jobs_df = gd_df
            except:
                pass

            if jobs_df is not None and not jobs_df.empty:
                for _, row in jobs_df.iterrows():
                    job = {
                        "id": str(len(job_list) + 1),
                        "title": str(row.get("title", "")),
                        "company": str(row.get("company", "")),
                        "location": str(row.get("location", "")),
                        "salary": "Not Disclosed",
                        "job_url": str(row.get("job_url", "")),
                        "source": str(row.get("site", "")).upper(),
                        "date_posted": str(row.get("date_posted", "")),
                        "job_type": str(row.get("job_type", "")),
                    }
                    
                    min_amt = row.get("min_amount")
                    max_amt = row.get("max_amount")
                    if min_amt and max_amt:
                        job["salary"] = f"{float(min_amt):,.0f} - {float(max_amt):,.0f}"
                    
                    desc = str(row.get("description", ""))
                    job["description"] = desc[:500] + "..." if len(desc) > 500 else desc
                    
                    if job["title"] and job["job_url"]:
                        job_list.append(job)

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
            return

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(job_list).encode())
        return
