import sys
import json
import warnings
warnings.filterwarnings("ignore")

try:
    from jobspy import scrape_jobs
except ImportError:
    print(json.dumps({"error": "python-jobspy not installed. Run: pip install python-jobspy"}))
    sys.exit(1)

def fetch_jobs(search_term: str, location: str = "India", city: str = "", count: int = 20):
    """
    Multi-source job scraper using JobSpy.
    Supports Indeed, LinkedIn, and Glassdoor.
    """
    # Robust Smart City Correction (Glassdoor/Indeed Fix)
    city_map = {
        "bengaluru": "Bangalore",
        "benglore": "Bangalore",
        "bengalore": "Bangalore",
        "banglore": "Bangalore",
        "mumbai": "Mumbai",
        "bombay": "Mumbai",
        "gurugram": "Gurgaon",
        "gurgaon": "Gurgaon",
        "delhi": "Delhi",
        "new delhi": "Delhi",
        "ncr": "Delhi",
        "hyderabad": "Hyderabad",
        "chennai": "Chennai",
        "madras": "Chennai",
        "kolkata": "Kolkata",
        "calcutta": "Kolkata",
        "pune": "Pune",
    }
    
    clean_city = city.lower().strip()
    if clean_city in city_map:
        clean_city = city_map[clean_city]
    else:
        # Fallback to original casing if no map match
        clean_city = city
    
    # Build location string
    search_location = f"{clean_city}, {location}" if clean_city else location
    
    # Glassdoor specifically often fails with "City, Country" but works with just "City"
    glassdoor_location = clean_city if clean_city else location

    try:
        # We perform two scrapes if Glassdoor is requested to ensure location precision
        sites = ["indeed", "linkedin"]
        jobs_df = scrape_jobs(
            site_name=sites,
            search_term=search_term,
            location=search_location,
            results_wanted=count,
            hours_old=168,
            country_indeed="india",
            verbose=0
        )
        
        # Add Glassdoor results separately with optimized location
        try:
            gd_df = scrape_jobs(
                site_name=["glassdoor"],
                search_term=search_term,
                location=glassdoor_location,
                results_wanted=10,
                hours_old=168,
                verbose=0
            )
            import pandas as pd
            if gd_df is not None and not gd_df.empty:
                if jobs_df is not None and not jobs_df.empty:
                    jobs_df = pd.concat([jobs_df, gd_df], ignore_index=True)
                else:
                    jobs_df = gd_df
        except Exception as e:
            print(f"DEBUG: Glassdoor specific failure: {str(e)}", file=sys.stderr)

    except Exception as e:
        # Silently handle individual scraper failures
        print(f"DEBUG: Primary Scraper failure: {str(e)}", file=sys.stderr)
        return []

    if jobs_df is None or len(jobs_df) == 0:
        return []

    job_list = []
    for _, row in jobs_df.iterrows():
        job = {
            "id": str(len(job_list) + 1),
            "title": str(row.get("title", "")) if row.get("title") else "",
            "company": str(row.get("company", "")) if row.get("company") else "",
            "location": str(row.get("location", "")) if row.get("location") else "",
            "salary": "Not Disclosed",
            "description": "",
            "job_url": str(row.get("job_url", "")) if row.get("job_url") else "",
            "source": str(row.get("site", "")).upper() if row.get("site") else "INDEED",
            "date_posted": str(row.get("date_posted", "")) if row.get("date_posted") else "",
            "job_type": str(row.get("job_type", "")) if row.get("job_type") else "",
            "is_remote": bool(row.get("is_remote", False)),
        }

        # Extract salary data
        min_amt = row.get("min_amount")
        max_amt = row.get("max_amount")
        interval = row.get("interval", "")
        if min_amt and max_amt:
            try:
                job["salary"] = f"{float(min_amt):,.0f} - {float(max_amt):,.0f} ({interval})"
            except (ValueError, TypeError):
                pass
        elif min_amt:
            try:
                job["salary"] = f"{float(min_amt):,.0f}+ ({interval})"
            except (ValueError, TypeError):
                pass

        # Richer description (up to 500 chars)
        desc = row.get("description", "")
        if desc and isinstance(desc, str):
            job["description"] = desc[:500] + "..." if len(desc) > 500 else desc

        if job["title"] and job["job_url"]:
            job_list.append(job)

    return job_list

def main():
    search = "electrician"
    location = "India"
    city = ""

    if len(sys.argv) > 1:
        search = sys.argv[1]
    if len(sys.argv) > 2:
        location = sys.argv[2]
    if len(sys.argv) > 3:
        city = sys.argv[3]

    jobs = fetch_jobs(search, location, city, count=20)
    
    # We must only print the JSON, nothing else, so the API route can parse it.
    print(json.dumps(jobs))

if __name__ == "__main__":
    main()
